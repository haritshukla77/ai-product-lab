# Developer Replication Guide: Strategic Decision OS

This kit contains the design specifications, prompts, and schemas for Strategic Decision OS. The [project case study](../README.md) describes the implemented workflow and how to run it.

## 1. System Philosophy
The system is built as a **Sequential Synchronous State Machine**. Unlike parallel or swarm-based agent architectures, this system enforces a logic chain where each agent's findings are injected into the context of the next.

## 2. Technical Core: Schema-Driven Reasoning
The reliability of this platform depends on strict JSON schema enforcement at the LLM level. Every agent call uses a specific `responseSchema` to prevent parsing errors and ensure UI components (React) can render findings predictably.

### Agent Workflow States:
1. `not_run`: Initial state.
2. `running`: API request in flight.
3. `review_required`: HITL gate triggered (Confidence < Medium, or High Risk).
4. `accepted`: Human or auto-approved result.
5. `edited`: Human-modified agent output.

## 3. Human-In-The-Loop (HITL) Logic
Implement the following triggers in your orchestration logic:
- `low_confidence`: If `agent.confidence === 'low'`.
- `evidence_gap`: If `agent.evidence_gaps.any(g => g.impact === 'high')`.
- `regulated_domain`: If `input.industry` contains keywords like *Healthcare*, *Banking*, or *Legal*.

## 4. Key Directory Structure
- `/src/services/geminiService.ts`: The definition of all System Prompts and Zod-like JSON Schemas.
- `/src/types.ts`: TypeScript interfaces defining the handoff objects between agents.
- `/src/App.tsx`: The central state machine and HITL orchestration loop.

## 5. Development Setup
1. **API Integration:** Use the `@google/genai` SDK.
2. **Model tiering.** The implementation uses Gemini Flash for analysis and Gemini Pro for executive synthesis. Check the [model configuration](../src/services/geminiService.ts) for the exact model IDs.
3. **Environment:** Set `GEMINI_API_KEY` in your project settings.

## 6. Testing the Logic
Use the **Healthcare AI Platform** demo case provided in the UI.
- Verify that a high-severity risk or incomplete governance controls in a regulated domain triggers review. Check the visible reason against the [implemented conditions](../src/App.tsx).
