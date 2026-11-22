# Changes from Mistral’s original notebook

This records the differences between the upstream Transcript-to-PRD-to-Ticket example and the notebook in this folder. The project uses the same sample transcript, Mistral OCR-to-PRD workflow, automated feedback concept, and Linear GraphQL API. [Upstream notebook](https://github.com/mistralai/cookbook/blob/main/mistral/agents/non_framework/transcript_linearticket_agent/TranscriptToLinearTicketAgent.ipynb) · [Upstream article](https://mistral.ai/news/agentic-workflows-from-meetings-to-dev-tickets/) · [MIT license](LICENSE)

| Area | Original notebook | This project |
|---|---|---|
| Colab setup | Installs with `!pip`, imports `Mistral` from `mistralai.client`, and pins Pydantic 2.10.6. | Uses `%pip`, imports `Mistral` from `mistralai`, installs the `gql` requests extra, and pins Pydantic 2.14.2 to match the Colab environment used for the project. |
| Configuration | Credentials and team are placeholders in the configuration cell. The ticket agent names its model directly. | Uses Colab Secrets for the two API keys and the Linear team UUID. Both text agents use the configured model, `mistral-large-latest` by default. A project name identifies saved state. |
| Transcript | Downloads the sample PDF and calls Mistral OCR from a standalone parse step. | **Open project** runs the same upload, signed URL, and OCR sequence for a new project. A saved project supplies the extracted transcript on later runs. The PDF file handle is closed after upload. |
| Model response handling | Uses SDK chat methods to complete and parse responses. | A shared REST helper extracts answer text from plain responses or chunked responses containing model thinking blocks. It reports empty or truncated text. Ticket drafting requests JSON with low reasoning effort and an 8,192-token cap. |
| Automated PRD review | Generates a PRD, asks Mistral for feedback, and refines in up to three rounds. | Keeps the review loop for first publish. Prompts explicitly check for unsupported targets, proposals presented as commitments, and contradictions. A `None.` response ends the loop early. |
| PRD scope and human feedback | Produces a PRD and passes it to the ticket agent automatically. | Uses Markdown `REQ` headings for actionable work. `APPROVE`, `REVISE`, and `STOP` let a human review the draft. Revisions display the PRD again for approval. |
| Ticket drafting | Parses the PRD into parallel feature and description lists. | Creates structured ticket records with a requirement ID, title, and description. Validation requires one nonempty draft per recognized requirement ID. The prompt keeps unagreed targets and implementation details open. |
| First publish | Creates a batch directly after parsing the PRD. | Shows each draft after PRD approval. Separate `APPLY` confirmation publishes the preview and saves the requirement-to-issue links. |
| Later revisions | The orchestrator creates tickets each time it runs. | Reopens the saved PRD and lists linked requirements. A reviewer selects one and provides feedback. The code replaces only that PRD section’s body. After approval it shows a description diff for the linked issue and uses `issueUpdate` when the reviewer types `APPLY`. |
| State and recovery | Returns PRD, features, and results in notebook memory. | Saves the extracted transcript, approved PRD, links, and pending plan to a project JSON. Confirmed plans are recorded before writes. Completed actions are saved as they finish. Replays use the saved issue UUIDs and skip completed actions. |
| State inspection | Has separate output cells for the PRD, features, and created issue URLs. | **Saved result** reads the latest applied PRD and prints its requirement-to-issue UUIDs. The public notebook has cleared outputs. |

## Live rehearsal adjustment

The repo notebook defaults to Google Drive for project state. Colab’s Drive mount failed during the live rehearsal, so the local copy saved its project JSON under `/content/transcript-to-linear`. The publish, revision, and replay were performed in that session. The [runbook](RUNBOOK.md#if-drive-authorization-fails) explains how to back up and restore that JSON.

The [evaluation notes](evals/README.md) distinguish historical content checks, simulated recovery checks, and live results.
