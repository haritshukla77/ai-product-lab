# Evaluation

Start with the live Le Chat walkthrough. The quality examples show what the model produced in targeted cases. The executable checks verify workflow behavior under simulated failures. The measurement protocol defines how to benchmark the workflow against manual drafting.

[Live rehearsal](#live-colab-rehearsal) · [Historical quality checks](#historical-quality-checks) · [Executable checks](#revision-workflow-verification) · [Measurement protocol](#measurement-protocol) · [Model comparison](#model-comparison)

## Live Colab rehearsal

The first publish and later revision used the same saved project with Colab runtime storage. The case follows two decisions from the [Le Chat planning transcript](https://github.com/mistralai/cookbook/blob/main/mistral/agents/non_framework/transcript_linearticket_agent/lechat_product_call_trascript.pdf). Peak-load latency was actionable and its threshold was open. The community forum was exploratory.

| Stage | Expected behavior | Observed evidence |
|---|---|---|
| Source and PRD review | Treat peak-load latency as agreed work and leave the threshold open. Keep the forum under Proposed Ideas. | The PM asked the agent to reserve requirement IDs for actionable work. The revised PRD kept exploratory ideas out of the actionable requirements and left the latency threshold open. [Feedback](../assets/workflow/01-prd-review-feedback.png) · [Approved PRD](../assets/workflow/02-prd-review-approval.png) |
| Preview and first publish | Draft the agreed work, then create the previewed issues after `APPLY`. | Colab reported **12 created, 0 updated** with requirement-to-issue links. The Linear batch ran from HAR-26 through HAR-37. [Preview](../assets/workflow/03-ticket-preview-apply.png) · [Apply result](../assets/workflow/04-first-publish-result.png) · [Linear batch](../assets/workflow/05-linear-created-issues.png) |
| Feedback on the linked requirement | Add peak-traffic p95 measurement when the reviewer requests it. Leave the latency SLA and peak-load definition open. | The reviewer selected REQ-001. The proposed description diff for HAR-26 added the measurement and kept both decisions open. [Original issue](../assets/workflow/har-26-before-revision.png) · [Feedback step](../assets/workflow/06-revision-select-requirement.png) · [Preview diff](../assets/workflow/07-revision-preview-diff.png) |
| Apply the revision and replay | Update HAR-26 in place. Replaying the completed apply should make zero writes. | After confirmation, Colab reported **0 created, 1 updated** for HAR-26. **Saved result** showed 12 links. The guarded in-session replay found no pending plan and returned **0 created, 0 updated**. [Revision result](../assets/workflow/08-revision-apply-result.png) |

## Case LECHAT-001

### Historical quality checks

The input was Mistral’s [Le Chat sample meeting transcript](https://github.com/mistralai/cookbook/blob/main/mistral/agents/non_framework/transcript_linearticket_agent/lechat_product_call_trascript.pdf). The evaluation compared two historical Linear issues with a preview generated after PRD review and a ticket-prompt change. The exact run provenance of the earlier PRD export remains unverified.

| Check | Before | After | Verdict |
|---|---|---|---|
| Peak-load targets (HAR-5) | The issue introduced a 99.9% availability target and zero critical latency-related support tickets within 30 days. Neither appeared in the transcript or reviewed PRD export. An intermediate preview also introduced a two-second response target, 10,000 concurrent users, and an 80% auto-scaling trigger. | With the same revised PRD and a stricter ticket prompt, the draft preserved the latency problem and left the SLA and peak-load thresholds open. | Passed the targeted replay. The latency target remained an open decision. |
| Community forum scope (HAR-22) | The transcript raised the forum in brainstorming. The reviewed PRD export listed it as both a next-update priority and an innovative idea. The issue framed it as work to build. | The automated review placed it under innovative ideas, and human feedback clarified that platform selection follows the decision to proceed. None of the nine preview drafts proposed building the forum. | Passed the targeted replay. Multiple changes contributed to the result, so their individual effects remain unknown. |

## Revision workflow verification

From the project directory, run `python evals/check_workflow.py` with Pydantic 2 installed. The check uses simulated Mistral and Linear responses and temporary project files. [Executable checks](check_workflow.py)

| Check | Expected behavior verified by the script |
|---|---|
| Approval and cancellation | Stopping at PRD review or declining `APPLY` results in zero Linear writes. |
| Interrupted create | Resuming with the saved issue UUID completes the batch without a duplicate. |
| Targeted revision | The original issue ID receives one description update. The title, other issue, and saved links are preserved. |
| Replay and unchanged revision | A replay after restart and a revision with identical requirement text make zero writes. |
| Stale preview | A mismatched description blocks the update. |
| Malformed JSON or truncated output | Drafting stops before `APPLY`. No plan is saved and no issues are written. |
| Missing or duplicate requirement drafts | The ticket validator rejects the batch before `APPLY`. No plan is saved and no issues are written. |
| No actionable requirements | `APPLY` saves the approved PRD with zero links, zero writes, and no pending plan. |

## Measurement protocol

Use LECHAT-001 as the first reference case and build a **6–10 case pilot**. Include a straightforward meeting, a poor-quality PDF, disputed or exploratory scope, a long transcript, a meeting with no actionable work, and feedback on a linked issue. The benchmark and manual baseline are pending.

Have a PM and engineer label the decision-bearing transcript excerpts, actionable requirements, proposed ideas, and open decisions before scoring either workflow. For revisions, record the expected change, target issue ID, and unrelated content that should be preserved. When a reviewer adds a new decision, use it as evidence from that step forward.

| Checkpoint | What to score |
|---|---|
| PDF → extracted transcript | Decision-bearing text survives extraction, including numbers and who made a commitment when attribution matters. |
| Extracted text → PRD | Score requirement recall and unsupported commitments against the labeled source. Check that proposals stay exploratory and unresolved decisions stay open. |
| PM review → approved PRD | Check whether the revision reflects the feedback. Record corrections to model output and new human decisions separately. Count both in active review time. |
| Approved PRD → ticket preview | Check requirement-to-draft correspondence, testable acceptance criteria, and unsupported commitments against the source and approved decisions. |
| Preview → Linear | Verify the expected issue IDs, content, and links after `APPLY`. Check for extra writes. On a revision, verify the original issue ID and check that unrelated issues were preserved. |

### Scoring and reporting

- **Compare manual and assisted work on the same cases.** Use one acceptance rubric and expect equivalent requirement-to-issue traceability in both workflows. Assign different operators or alternate the order to reduce the benefit of seeing a case twice. Log active minutes by role, including edits, failed attempts, and manual fallback. If zero issues pass, report the effort and zero count.
- **Count each task once across retries.** Record a verified completion, a deliberate stop, or a failure if the expected outcome misses the evaluation deadline. Include all started tasks in the completion-rate denominator and report deliberate stops separately. Count expected no-ops as completions when the saved state and zero writes match the case. Track any system error by stage, even when a retry succeeds.
- **Verify confirmed plans with writes.** For assisted runs, reconcile each plan against Linear by the deadline. Count a resumed plan under the original confirmation. Test zero writes when confirmation is withheld. Report critical write failures separately.
- **Report quality and timing with raw counts.** Count each agreed requirement once for recall and each artifact with an unsupported commitment once per stage. When the reference contains zero actionable requirements, report whether the workflow produced the expected zero issues. Use comparable start points for manual and assisted tasks. Record elapsed time, human wait, and time to first complete preview. Report the median with successful and total task counts, then p95 once there are enough observations.
- **Record the run configuration.** Save the case ID, notebook commit, exact model version, prompts, reasoning effort, token limits, timeouts, and retry outcomes. Report first publishes and linked revisions separately.

Apply the [proposed pilot criteria](../README.md#success-metrics) to the paired manual baseline. [NIST usability testing](https://www.nist.gov/programs-projects/usability-testing) · [Google SRE monitoring guidance](https://sre.google/sre-book/monitoring-distributed-systems/) · [Task-specific evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices)

## Model comparison

| Decision | Controlled comparison | Decision rule |
|---|---|---|
| **Model for ticket drafting** | Feed the same approved PRDs to pinned Mistral Large and Mistral Small versions. Hold the prompt, schema, output cap, and timeout fixed. Use a common reasoning setting where supported. If supported settings differ, report the result for each full configuration. | Switch if Small preserves requirement recall, grounded acceptance criteria, and preview completion while improving latency or cost per accepted issue. Track timeouts, truncation, and reviewer edits. |
| **Reasoning effort by stage** | Change only the reasoning setting on one pinned model. Use the same transcripts for PRD generation or review and the same approved PRDs for ticket drafting. Repeat long and ambiguous cases and keep prompts, token limits, and timeouts fixed. | Increase effort when the reduction in missed requirements, unsupported commitments, or reviewer rework justifies added latency or cost. Check that faster settings still produce complete, reviewable drafts. |

Both comparisons are pending. Use an exact version ID for each run because the `-latest` alias can change. [Mistral reasoning settings](https://docs.mistral.ai/inference/conversations/reasoning) · [Mistral model lifecycle](https://docs.mistral.ai/inference/model-lifecycle)

## Limits

The live evidence covers one transcript, one linked revision, and an in-session replay. The historical quality comparison covers two targeted examples and combined prompt and review changes. The restart and interrupted-write cases were simulated. Google Drive reconnection and a live fresh-runtime replay remain unverified. Estimating time savings and failure rates requires the benchmark and manual baseline.

See the [runbook](../RUNBOOK.md) to reproduce the live checks and back up runtime state.
