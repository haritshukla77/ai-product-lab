# Strategic Decision OS

A Gemini-based decision support prototype for leaders weighing build, partner, and hybrid options. It produces a recommendation with the evidence gaps, assumptions, and risks a decision owner needs to review. [PRD](docs/PRD.md) · [Screen behavior](docs/SCREEN_BEHAVIOR.md) · [Prompts and schemas](developer-kit/) · [Source](src/)

## Product use case

The built-in case asks whether a regulated healthcare platform should build its own agent orchestration layer, partner with a hyperscaler, or take a hybrid approach. Product needs to weigh time to market and customer demand alongside platform leverage, investment, vendor lock-in, and governance. The decision owner uses the memo to review the recommendation and decide what evidence is needed before a commitment.

## Workflow

**Frame the decision → review product, platform, finance, and risk → resolve review gates → synthesize the memo**

| Stage | What it produces |
|---|---|
| Decision framing | Refines the question, identifies options and success criteria, and surfaces high-impact missing inputs. |
| Product and market | Assesses customer need, buyer urgency, and the quality of available evidence. |
| Platform strategy | Compares integration complexity, platform fit, and technical debt against the options. |
| Financial impact | Surfaces investment, opportunity cost, and payback uncertainty. |
| Risk and governance | Identifies risks, residual exposure, and controls that need review. |
| Executive synthesis | Combines accepted findings into a recommendation, key risks, assumptions, next steps, and criteria for reconsidering the decision. The user can export the recommendation as Markdown. |

In **Guided Review Mode**, the user reviews each stage. In **Autonomous with HITL Gates**, rules pause when conditions such as low confidence, weak evidence, or high-severity risks are met. The UI shows the reason for the pause. **Override gaps** lets the user explicitly proceed to synthesis with unresolved inputs. [Workflow and review rules](src/App.tsx)

## Run locally

1. From `Decision OS Agent`, run `npm ci` and set `GEMINI_API_KEY` in a local `.env.local` file.
2. Run `npm run dev` and open [localhost:3000](http://localhost:3000).
3. Start with the prefilled build, partner, and hybrid scenario. Use **Guided Review Mode** to inspect each agent's output and decision before continuing.
4. Generate the executive recommendation, then review its assumptions and next steps before exporting the Markdown memo.

The local demo makes Gemini calls from the browser. A shared deployment would keep model credentials on a server and define access, retention, and audit requirements. [Model calls](src/services/geminiService.ts) · [Local server](server.ts)

## Success metrics

| Metric | How to measure it |
|---|---|
| Active time to a decision-ready memo | PM and stakeholder minutes from brief to accepted memo, including review and corrections. Compare with manual analysis on the same case. |
| Review gate recall | Expert-labeled cases requiring a pause that trigger the expected gate ÷ cases requiring a pause. Track unnecessary pauses separately. |
| Grounding and decision quality | Score whether the memo compares all supplied options, supports claims with the provided evidence, and marks assumptions, unresolved risks, and follow-up decisions. |

The PRD records design targets. A manual baseline and scored benchmark are pending. [Original design targets](docs/PRD.md#6-non-functional-requirements)

## Product trade-offs

| Decision | Why it fits | What to watch |
|---|---|---|
| Sequential analysis | Platform, finance, and risk stages can use earlier findings. The final synthesis has a clear trail of inputs to review. | Sequential calls add latency and can carry an early unsupported assumption forward. |
| Guided review and conditional gates | Users can choose full review or intervene at explicit risk and evidence checks. | Gate rules rely partly on model-reported confidence and severity. Validate the triggers against expert labels, especially on regulated scenarios. |
| Flash analysis and Pro synthesis | The code uses a Gemini Flash preview model for stage analysis and a Gemini Pro preview model for the final synthesis. Each call requests a schema-constrained response. | Compare memo quality, elapsed time, and cost on the same briefs before treating the model split as an improvement. [Model configuration](src/services/geminiService.ts) |

## Evaluation evidence

The local Vite build passed with `npm run build`. The repo includes the built-in scenario, stage prompts, schema definitions, and review rules for reproducing the proposed checks below.

| Scenario | What to verify |
|---|---|
| Clear build, partner, and hybrid brief | The memo evaluates all three options, explains the recommendation, and ties next steps to the decision criteria. |
| Missing business objective or weak market evidence | The appropriate stage pauses for review. The memo records the gap and any assumptions carried forward. |
| High-severity risk or incomplete governance controls | The gate shows the reason for expert review. The memo carries the open risk through to the decision owner. |
| Explicit override with unresolved gaps | The user takes the override action and the exported recommendation preserves the unresolved evidence and assumptions. |

[Demo scenario and gates](src/App.tsx) · [Original requirements](docs/PRD.md) · [Agent schemas](developer-kit/schemas/)
