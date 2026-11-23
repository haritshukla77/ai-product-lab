import json
import re
from contextlib import redirect_stdout
from copy import deepcopy
from difflib import unified_diff
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from typing import Optional
from unittest import TestCase
from unittest.mock import Mock, patch
from uuid import uuid4

from pydantic import BaseModel, ValidationError


class TransportError(Exception):
    pass


class FakeLinear:
    def __init__(self):
        self.issues = {}
        self.created = 0
        self.updated = 0
        self.interrupt_after_create = False

    def execute(self, operation, variable_values):
        values = variable_values
        key = values["id"]
        if "mutation CreateIssue" in operation:
            if key in self.issues:
                raise TransportError("Duplicate UUID")
            self.created += 1
            issue = dict(
                id=key, identifier=f"TEST-{self.created}", title=values["title"],
                description=values["description"], url=f"https://linear.example/{key}",
                team={"id": values["team"]},
            )
            self.issues[key] = issue
            if self.interrupt_after_create:
                self.interrupt_after_create = False
                raise OSError("Runtime disconnected after remote create")
            return {"issueCreate": {"success": True, "issue": deepcopy(issue)}}
        if "mutation UpdateIssue" in operation:
            self.updated += 1
            self.issues[key]["description"] = values["description"]
            return {"issueUpdate": {"success": True, "issue": {"id": key}}}
        return {"issue": deepcopy(self.issues[key])}


baseline = """# PRD

### [REQ-001] Peak performance

Improve peak-load latency. Target TBD.

### [REQ-002] Accessibility

Improve keyboard navigation.
"""
revised_body = "Improve peak-load latency. Peak load and the latency SLA remain open."
ticket_after = "Address peak load. Leave the latency SLA open."

file_path = Path(__file__).resolve().parents[1] / "TranscriptToLinear_RevisionWorkflow.ipynb"
notebook = json.loads(file_path.read_text())
fake = FakeLinear()
scope = dict(
    globals(), copy=SimpleNamespace(deepcopy=deepcopy),
    gql=lambda query: query, Client=lambda **kwargs: fake,
    RequestsHTTPTransport=lambda **kwargs: None,
    Markdown=str, display=print,
)
for index in (9, 11, 13):
    text = "".join(notebook["cells"][index]["source"])
    exec(compile(text, f"cell-{index}", "exec"), scope)


def model_response(api_key, model, prompt, **options):
    if "Revise only the requirement body" in prompt:
        return revised_body
    if "Review the draft PRD" in prompt:
        return "None."
    if "exactly one engineering ticket" in prompt:
        ids = re.findall(r"^\[(REQ-\d+)\]", prompt, re.MULTILINE)
        return json.dumps({"tickets": [
            {"requirement_id": key, "title": f"Draft {key}", "description":
             ticket_after if "remain open" in prompt else f"Original description {key}"}
            for key in ids
        ]})
    return baseline


real_complete_text = scope["complete_text"]
scope["complete_text"] = model_response
Workflow = scope["WorkflowOrchestrator"]

config = SimpleNamespace(
    MISTRAL_API_KEY="test", MISTRAL_MODEL="test",
    LINEAR_API_KEY="test", LINEAR_TEAM_ID="test-team",
    LINEAR_GRAPHQL_URL="https://example.invalid",
)


def run(flow, *answers):
    with patch("builtins.input", side_effect=answers), redirect_stdout(StringIO()):
        return flow.run()


with TemporaryDirectory() as folder:
    path = Path(folder) / "project.json"
    flow = Workflow(config, "transcript", path)
    assert run(flow, "STOP") is None
    assert not path.exists() and fake.created == 0
    assert run(flow, "APPROVE", "STOP") is None
    assert not path.exists() and fake.created == 0
    fake.interrupt_after_create = True
    try:
        run(flow, "APPROVE", "APPLY")
    except OSError:
        pass
    else:
        raise AssertionError("Initial run should stop after ambiguous create")
    assert fake.created == 1
    assert len(flow.load_state()["pending"]["actions"]) == 2
    flow = Workflow(config, "transcript", path)
    assert run(flow, "APPLY") == {"created": 1, "updated": 0}
    links = deepcopy(flow.state["links"])
    assert len(links) == 2 and fake.created == 2
    control = deepcopy(fake.issues[links["REQ-002"]])

    assert run(flow, "1", "Feedback", "REVISE", "More feedback", "STOP") is None
    assert fake.created == 2 and fake.updated == 0
    assert run(flow, "1", "Feedback", "APPROVE", "STOP") is None
    assert fake.created == 2 and fake.updated == 0

    result = run(flow, "1", "Feedback", "APPROVE", "APPLY")
    assert result == {"created": 0, "updated": 1}
    assert fake.issues[links["REQ-001"]]["description"] == ticket_after
    assert fake.issues[links["REQ-001"]]["title"] == "Draft REQ-001"
    assert fake.issues[links["REQ-002"]] == control
    assert flow.state["links"] == links
    assert scope["read_requirements"](flow.state["prd"])["REQ-002"]["body"] == "Improve keyboard navigation."
    assert flow.state["pending"] is None
    flow = Workflow(config, "transcript", path)
    assert flow.apply_changes() == {"created": 0, "updated": 0}
    assert run(flow, "1", "Same feedback", "APPROVE") is None
    assert fake.created == 2 and fake.updated == 1

    try:
        flow.linear_agent.update_ticket(links["REQ-001"], "Different target", "Old view")
    except ValueError:
        pass
    else:
        raise AssertionError("Outdated preview should fail")
    assert fake.updated == 1
    assert run(flow, "") is None

def chat_response(content, finish_reason="stop"):
    choice = {"finish_reason": finish_reason, "message": {"content": content}}
    return SimpleNamespace(raise_for_status=lambda: None, json=lambda: {"choices": [choice]})


# Exercise the real response and ticket validators with simulated API responses.
checks = TestCase()
with TemporaryDirectory() as folder:
    path = Path(folder) / "project.json"
    flow = Workflow(config, "transcript", path)
    before = deepcopy(flow.state)
    write_counts = fake.created, fake.updated
    issues_before = deepcopy(fake.issues)

    draft = {
        "requirement_id": "REQ-001",
        "title": "Peak performance",
        "description": "Measure latency.",
    }
    requirement_error = "one ticket for each supplied requirement ID"
    invalid_drafts = [
        ("malformed JSON", chat_response('{"tickets":'), ValidationError, "Invalid JSON"),
        ("truncated output", chat_response('{"tickets":', "length"), ValueError, "response was cut off"),
        ("missing draft", chat_response(json.dumps({"tickets": [draft]})), ValueError, requirement_error),
        ("duplicate draft", chat_response(json.dumps({"tickets": [draft, draft]})), ValueError, requirement_error),
    ]
    for label, response, error_type, message in invalid_drafts:
        post = Mock(side_effect=[chat_response(baseline), chat_response("None."), response])
        with patch.dict(scope, {
            "complete_text": real_complete_text,
            "requests": SimpleNamespace(post=post),
        }):
            with checks.assertRaisesRegex(error_type, message):
                run(flow, "APPROVE")
        assert post.call_count == 3, label
        ticket_prompt = post.call_args.kwargs["json"]["messages"][0]["content"]
        assert "exactly one engineering ticket" in ticket_prompt, label
        assert not path.exists() and flow.state == before, label
        assert (fake.created, fake.updated) == write_counts and fake.issues == issues_before, label

    exploratory_prd = "# PRD\n\n## Proposed Ideas\n\nExplore a community forum.\n"
    completion = Mock(side_effect=[exploratory_prd, "None."])
    with patch.dict(scope, {"complete_text": completion}):
        assert run(flow, "APPROVE", "APPLY") == {"created": 0, "updated": 0}
    assert completion.call_count == 2
    saved = flow.load_state()
    assert saved["prd"] == exploratory_prd and saved["links"] == {} and saved["pending"] is None
    assert (fake.created, fake.updated) == write_counts and fake.issues == issues_before

print("Passed: approval and cancellation, ambiguous-create retry, automatic links, same-issue update, unaffected issue, replay after restart, and stale preview.")
print("Passed: malformed or truncated ticket output, missing or duplicate requirement drafts, and empty implementation scope.")
