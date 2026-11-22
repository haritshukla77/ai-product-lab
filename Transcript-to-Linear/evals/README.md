# Evaluation

## Measurement protocol

1. **Select 6–10 cases for the first benchmark.** Include straightforward planning, ambiguous or exploratory scope, a long transcript, and a revision to an existing issue. Before either workflow runs, a PM and engineer label agreed requirements, proposed ideas, and open decisions from the transcript and recorded human decisions. For revisions, also record the expected change and the linked Linear issue ID.
2. **Run manual and assisted workflows on the same inputs.** Use the same issue acceptance rubric in both. Favor different operators or alternate the order to reduce the benefit of having seen a case before. Record active minutes by role for transcript review, drafting, review, edits, sign-off, and any manual fallback. Include the effort spent on failed attempts. Report first publishes and revisions separately. If a set yields zero accepted issues, show the effort and zero issue count directly.
3. **Score coverage and scope.** Count each agreed requirement once when an accepted issue represents it accurately. For revisions, score the agreed changes for the selected requirement. At preview and sign-off, flag each issue with an unsupported commitment once per stage. For example, a numeric SLA needs evidence in the transcript or an explicit human decision. An unresolved threshold can stay open. Report raw counts alongside the rates.
4. **Verify Linear writes.** Verify the issue IDs, intended changes, and any extra writes against the confirmed plan. Set a completion window before the pilot and count plans that miss it as failures. Count a resumed plan under the original confirmation. Track deliberate stops separately and verify zero writes when `APPLY` was withheld. Exercise interrupted creates, completed replays, and stale previews in the workflow checks below.
5. **Measure preview latency by workflow.** Start the clock at transcript processing for a first publish and at feedback submission for a revision. Record time to a complete preview, time waiting at human prompts, and attempts that time out, truncate, or fail validation. Report the median with the successful and total attempt counts. Add p95 after enough runs to estimate tail latency.

Evaluate the proposed [pilot bar](../README.md#success-metrics) against the paired manual baseline. The scorecard follows task-specific evaluation and user-facing reliability measurement practices. [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) · [Google SRE guidance on SLOs](https://sre.google/workbook/implementing-slos/)

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
