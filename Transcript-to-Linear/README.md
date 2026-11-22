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

| Decision | Trade-off |
|---|---|
| Review the PRD before drafting tickets | Adds model and reviewer time. It gives the PM a chance to catch an unapproved idea before it becomes backlog scope. |
| Review the ticket preview before writing | The ticket agent can add details that were absent from an approved PRD. A second check catches unagreed targets and implementation choices. |
| Keep stable requirement-to-issue links | Requires a persistent project file. It enables revisions to target the same issue even when wording or titles change. |
| Use one issue per actionable requirement | Keeps the Colab workflow predictable. Splitting or merging related issues calls for a separate review decision. |

In the live Colab rehearsal, the revised workflow created **12 linked issues** on first publish and made **zero writes** when the completed apply was replayed. The [evaluation notes](evals/README.md) document the targeted HAR-26 revision and the separate simulated recovery checks.

## Credits

Adapted from Mistral AI’s [Transcript-to-PRD-to-Ticket notebook](https://github.com/mistralai/cookbook/blob/main/mistral/agents/non_framework/transcript_linearticket_agent/TranscriptToLinearTicketAgent.ipynb) and [workflow article](https://mistral.ai/news/agentic-workflows-from-meetings-to-dev-tickets/). The upstream [MIT license](LICENSE) is included.
