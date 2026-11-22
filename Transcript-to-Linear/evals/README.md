# Evaluation

## Case LECHAT-001

The input was Mistral’s [Le Chat sample meeting transcript](https://github.com/mistralai/cookbook/blob/main/mistral/agents/non_framework/transcript_linearticket_agent/lechat_product_call_trascript.pdf). The evaluation compared two historical Linear issues with a preview generated after PRD review and a ticket-prompt change. The exact run provenance of the earlier PRD export remains unverified.

| Check | Before | After | Verdict |
|---|---|---|---|
| Peak-load targets (HAR-5) | The issue introduced a 99.9% availability target and zero critical latency-related support tickets within 30 days. Neither appeared in the transcript or reviewed PRD export. An intermediate preview also introduced a two-second response target, 10,000 concurrent users, and an 80% auto-scaling trigger. | With the same revised PRD and a stricter ticket prompt, the draft preserved the latency problem and left the SLA and peak-load thresholds open. | Passed the targeted replay. Engineering still needs measurable targets before sign-off. |
| Community forum scope (HAR-22) | The transcript raised the forum in brainstorming. The reviewed PRD export listed it as both a next-update priority and an innovative idea. The issue framed it as work to build. | The automated review placed it under innovative ideas, and human feedback clarified that platform selection follows the decision to proceed. None of the nine preview drafts proposed building the forum. | Passed the targeted replay. Multiple changes contributed to the result, so their individual effects remain unknown. |

## Revision workflow verification

The executable check uses simulated Mistral and Linear responses and a temporary project file. From the project folder, run `python evals/check_workflow.py` with Pydantic 2 installed.

| Check | Observed in the simulation |
|---|---|
| Approval and cancellation | Stopping before PRD approval or declining the apply prompt recorded zero Linear writes. |
| Interrupted create | The workflow resolved the saved issue UUID on restart and completed the two-issue batch without a duplicate. |
| Targeted revision | One description was updated using its original issue ID, with zero creates. The other issue and the updated issue’s title were preserved. |
| Replay after restart | Replaying the completed apply made zero writes. |
| Stale preview | An intervening description change blocked the update. |

## Live Colab rehearsal

The revised workflow ran on the Le Chat sample using Colab runtime storage after Drive authorization failed. The rehearsal used one saved project for both publish and revision.

| Check | Live evidence |
|---|---|
| First publish | Colab reported **Created: 12 \| Updated: 0** and printed the requirement-to-issue links. The new batch ran from HAR-26 through HAR-37. |
| Human PRD revision | The revised draft kept translation, language expansion, user-facing analytics, and the community forum under Proposed Ideas. The exploratory section displayed no requirement headings for those ideas. |
| Targeted update | REQ-001 resolved to **HAR-26**. The preview added measurement of p95 response time and left the latency SLA and peak-load definition open. After confirmation, Colab reported `HAR-26: updated` and **0 created, 1 updated**. [Colab apply result](../assets/workflow/08-revision-apply-result.png) |
| Saved state and replay | **Saved result** displayed 12 requirement-to-issue links. The guarded replay confirmed no pending plan and returned **No changes to apply.**, with `{'created': 0, 'updated': 0}`. This was an in-session replay. |

## Limits

The live rehearsal captured a first publish, a linked issue update confirmed by Colab, and a zero-write replay in the same session. The restart and interrupted-write scenarios were exercised in simulation. Reconnecting to Google Drive and repeating the live test from a fresh runtime remain unverified. The output-quality evaluation covers one transcript and two targeted checks. It provides no estimate of failure frequency or review time saved.

See the [runbook](../RUNBOOK.md) to reproduce the live checks and back up runtime state.
