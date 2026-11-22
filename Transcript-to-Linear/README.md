# Transcript to Linear

Turn a product meeting transcript into a reviewed product requirements document (PRD) and an engineering backlog. When feedback changes a requirement, the notebook previews an update to its linked Linear issue.

[Open in Colab](https://colab.research.google.com/github/haritshukla77/ai-product-lab/blob/main/Transcript-to-Linear/TranscriptToLinear_RevisionWorkflow.ipynb) · [Notebook](TranscriptToLinear_RevisionWorkflow.ipynb) · [Runbook and workflow diagram](RUNBOOK.md) · [Changes from Mistral](CHANGES.md) · [Evaluation](evals/README.md)

## Product use case

After a planning meeting, a PM and engineer need to agree on which work is ready to enter the backlog. A transcript may mix existing problems, brainstorms, and decisions. The workflow gives the reviewers a first draft, highlights gaps, and carries their decisions through to the corresponding Linear issue.

## Workflow

1. **Generate and review.** Mistral OCR extracts the transcript. The PRD agent drafts requirements and runs up to three automated review rounds. A human can request revisions, approve the PRD, or stop.
2. **Preview and publish.** The ticket agent drafts one issue per actionable requirement. An explicit apply confirmation publishes the preview and records each requirement ID and Linear issue ID.
3. **Revise an existing issue.** On a later run, select a linked requirement and enter feedback. Approve the revised PRD and review the proposed description before applying it to the same issue. The saved project file lets the workflow resume after a runtime restart.

## Run in Colab

The [runbook](RUNBOOK.md) includes the full workflow, the feedback demo, and the fallback for Google Drive authorization errors.

1. Add `MISTRAL_API_KEY`, `LINEAR_API_KEY`, and `LINEAR_TEAM_ID` as Colab secrets and enable notebook access. Use a Linear test team and a key with permission to read, create, and update its issues.
2. Run setup through **Open project**. The notebook mounts Google Drive and uses Mistral’s sample transcript for a new project. The project file in Drive holds the transcript, approved PRD, issue links, and any pending apply plan.
3. Run **Review and apply**. Use `APPROVE` to reach the ticket preview and `APPLY` to confirm the Linear operation.
4. Run the same cell again with the same project name to revise a linked requirement. Use one Colab runtime per project. An empty project starts with fresh issue links, so use a separate test team if your previous demo created overlapping tickets.

## Product trade-offs

**Product decision.** Start with an approval-gated backlog workflow for one team. The unit of value is an accepted engineering issue. The success measure is **PM and engineering time per accepted issue**, from transcript review through final edits, compared with manual drafting. Ticket volume is an activity measure. A faster initial draft can still cost the team time if it creates scope disputes or rework.

### Model selection, latency, and quality

**Output truncation.** Early Mistral Large ticket-drafting runs hit the output limit twice, including after the cap went from 2,048 to 8,192 tokens. The screenshot shows `finish_reason="length"` and the guard stopping the run before it could parse incomplete JSON.

![Colab traceback showing ticket drafting stopped when the model reached the output limit](assets/mistral-output-truncation.jpg)

**What changed.** Raising the token cap alone still left a cut-off response. We kept the 8,192-token cap for larger batches and reduced how much the model had to generate. We set reasoning effort to `low` and asked for a short summary and up to three testable acceptance criteria per ticket. The approved PRD still determines the ticket count. The notebook checks for exactly one nonempty draft per eligible requirement ID before it shows the preview.

**Read timeout.** A separate drafting request hit the client’s 120-second read timeout while waiting for Mistral.

![Colab traceback showing the configured 120-second Mistral API read timeout](assets/mistral-read-timeout.jpg)

**What changed.** We increased the read timeout from 120 to 600 seconds to give slower responses more time during testing. This also increases how long the notebook can wait on a stalled request, which is why a shared deployment would need a bounded retry and latency budget.

**Observed result.** The combined configuration completed the live 12-issue run with Mistral Large. That made it the baseline for this notebook. The run changed several settings, so the effect of any one change is still unmeasured.

**Decision rule for a smaller model.** Evaluate Mistral Small with reasoning disabled for ticket drafting on the same reviewed PRDs, with the same prompt and output schema. Pin both model versions and repeat the long and ambiguous cases. Score coverage of agreed work, unsupported commitments, acceptance-criteria quality, completion and truncation rates, and reviewer edits. Compare median and p95 time to a reviewable batch and model cost per accepted issue. Switch the drafting stage only if Small meets the agreed quality bar while lowering latency or cost. This comparison is still pending.

### Human review and requirement identity

- **Approve scope before drafting.** Up to three automated review rounds catch transcript-to-PRD issues. The human then decides which work is actionable. In the live run, feedback removed requirement IDs from exploratory ideas before drafting. The explicit `REQ` headings give the pipeline a reliable eligibility rule. A reviewer still has to check whether each heading represents agreed work.
- **Approve the actual Linear change.** `APPROVE` authorizes drafting from the PRD. `APPLY` authorizes the previewed create or update. The second checkpoint costs reviewer time. It catches a different error: a ticket can turn a qualitative requirement into an unsupported SLA or implementation choice, even when the PRD is sound.
- **Keep issue identity stable across revisions.** The project saves each requirement ID with its Linear UUID. A revision updates the selected requirement and the linked issue description, so changes to a title or wording never drive ticket matching. One issue per requirement keeps the first release predictable. Splits, merges, and scope removals need explicit review because they can change ownership and dependencies.

### Failure handling and production controls

| Failure | Notebook behavior | Control for a shared production deployment |
|---|---|---|
| Model timeout, truncated JSON, or invalid requirement IDs | Drafting stops before the publish preview. Linear receives zero writes and the last applied project remains available. | Record failure reason, elapsed time, and token use by stage. Retry transient failures within a time budget. For recurring truncation, draft in bounded batches and validate all requirement IDs before showing a publish preview. |
| Linear write times out or a batch stops partway through | The confirmed plan and preassigned issue UUIDs are saved before writes. Each completed action is checkpointed. Resume skips completed actions and checks the same UUID when a create result is ambiguous. | Use a durable job store, serialize writes per project, and reconcile uncertain API results by UUID before retrying. Surface permanent permission and validation failures to the operator. |
| An issue changes after preview | The notebook re-reads the description before writing. If it already matches the proposed text, the operation is a no-op. An intervening edit blocks the update and calls for a fresh diff. | The read and write are separate calls. Use an atomic version check if the API supports one. Otherwise limit who can write the managed description and surface conflicts for human review. |
| Colab storage is lost or Drive authorization fails | The notebook can store a project JSON in the current runtime and restore it from a downloaded copy. The live rehearsal used this fallback. | Persist state outside the execution environment and test backup restore. Keep transcript access, retention, and issue-write credentials scoped to the team. |

### Rollout bar and evidence

Start in preview mode, then enable approval-gated writes for one team. Require clean fault tests for wrong-issue updates, duplicate creates, and writes without approval. Compare total reviewer time with the manual baseline before expanding. The live rehearsal created **12 linked issues**, previewed a targeted HAR-26 revision, and returned **0 creates and 0 updates** when the completed apply was replayed in the same session. Restart and interrupted-write recovery were tested in simulation. [Evaluation notes](evals/README.md) · [Recovery runbook](RUNBOOK.md#recover-from-an-interrupted-apply)

## Credits

Adapted from Mistral AI’s [Transcript-to-PRD-to-Ticket notebook](https://github.com/mistralai/cookbook/blob/main/mistral/agents/non_framework/transcript_linearticket_agent/TranscriptToLinearTicketAgent.ipynb) and [workflow article](https://mistral.ai/news/agentic-workflows-from-meetings-to-dev-tickets/). The upstream [MIT license](LICENSE) is included.
