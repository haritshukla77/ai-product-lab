import { GoogleGenAI, Type } from "@google/genai";
import { DecisionInput, DecisionFrame, ExecutiveRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXECUTIVE_SYNTHESIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    executive_recommendation: {
      type: Type.OBJECT,
      properties: {
        recommended_option: { type: Type.STRING },
        recommendation_type: { type: Type.STRING, enum: ["commit", "validate_first", "defer", "reject", "hybrid"] },
        summary: { type: Type.STRING },
        confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
      },
      required: ["recommended_option", "recommendation_type", "summary", "confidence"]
    },
    why_this_recommendation: { type: Type.ARRAY, items: { type: Type.STRING } },
    rejected_alternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          option: { type: Type.STRING },
          why_not_selected: { type: Type.STRING }
        },
        required: ["option", "why_not_selected"]
      }
    },
    key_tradeoffs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tradeoff: { type: Type.STRING },
          implication: { type: Type.STRING },
          stakeholder_most_affected: { type: Type.STRING, enum: ["product", "engineering", "finance", "legal", "GTM", "customer", "executive"] }
        },
        required: ["tradeoff", "implication", "stakeholder_most_affected"]
      }
    },
    critical_assumptions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          assumption: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["accepted", "weak", "needs_validation"] },
          validation_action: { type: Type.STRING }
        },
        required: ["assumption", "status", "validation_action"]
      }
    },
    evidence_gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
    risks_and_mitigations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          mitigation: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["high", "medium", "low"] }
        },
        required: ["risk", "mitigation", "severity"]
      }
    },
    what_would_change_the_decision: { type: Type.ARRAY, items: { type: Type.STRING } },
    next_30_days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING },
          owner: { type: Type.STRING, enum: ["product", "engineering", "design", "finance", "legal", "GTM", "executive"] },
          desired_output: { type: Type.STRING },
          success_measure: { type: Type.STRING }
        },
        required: ["action", "owner", "desired_output", "success_measure"]
      }
    },
    kill_or_reconsider_criteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion: { type: Type.STRING },
          threshold: { type: Type.STRING },
          review_timing: { type: Type.STRING },
          decision_owner: { type: Type.STRING }
        },
        required: ["criterion", "threshold", "review_timing", "decision_owner"]
      }
    },
    decision_quality_assessment: {
      type: Type.OBJECT,
      properties: {
        evidence_quality: { type: Type.STRING, enum: ["strong", "moderate", "weak"] },
        reversibility: { type: Type.STRING, enum: ["high", "medium", "low"] },
        risk_adjusted_attractiveness: { type: Type.STRING, enum: ["high", "medium", "low"] },
        platform_leverage: { type: Type.STRING, enum: ["high", "medium", "low"] }
      },
      required: ["evidence_quality", "reversibility", "risk_adjusted_attractiveness", "platform_leverage"]
    },
    final_boardroom_summary: { type: Type.STRING }
  },
  required: [
    "executive_recommendation", "why_this_recommendation", "rejected_alternatives", 
    "key_tradeoffs", "critical_assumptions", "evidence_gaps", "risks_and_mitigations", 
    "what_would_change_the_decision", "next_30_days", "kill_or_reconsider_criteria", 
    "decision_quality_assessment", "final_boardroom_summary"
  ]
};

const PRODUCT_MARKET_AGENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    agent_name: { type: Type.STRING },
    summary: { type: Type.STRING },
    customer_need_assessment: {
      type: Type.OBJECT,
      properties: {
        pain_severity: { type: Type.STRING, enum: ["high", "medium", "low", "unknown"] },
        buyer_urgency: { type: Type.STRING, enum: ["high", "medium", "low", "unknown"] },
        evidence_quality: { type: Type.STRING, enum: ["strong", "moderate", "weak", "missing"] },
        rationale: { type: Type.STRING }
      },
      required: ["pain_severity", "buyer_urgency", "evidence_quality", "rationale"]
    },
    market_attractiveness: {
      type: Type.OBJECT,
      properties: {
        timing: { type: Type.STRING, enum: ["favorable", "uncertain", "unfavorable"] },
        assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        evidence_gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["timing", "assumptions", "evidence_gaps"]
    },
    differentiation: {
      type: Type.OBJECT,
      properties: {
        potential: { type: Type.STRING, enum: ["high", "medium", "low", "unknown"] },
        basis: { type: Type.STRING },
        risk_of_commoditization: { type: Type.STRING, enum: ["high", "medium", "low"] }
      },
      required: ["potential", "basis", "risk_of_commoditization"]
    },
    adoption_barriers: { type: Type.ARRAY, items: { type: Type.STRING } },
    second_order_effects: { type: Type.ARRAY, items: { type: Type.STRING } },
    option_scores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          option: { type: Type.STRING },
          score: { type: Type.NUMBER },
          rationale: { type: Type.STRING }
        },
        required: ["option", "score", "rationale"]
      }
    },
    must_validate_before_commitment: { type: Type.ARRAY, items: { type: Type.STRING } },
    top_risk_or_concern: { type: Type.STRING },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    evidence_gaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          why_it_matters: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["high", "medium", "low"] }
        },
        required: ["item", "why_it_matters", "impact"]
      }
    },
    confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
  },
  required: [
    "agent_name", "summary", "customer_need_assessment", "market_attractiveness", 
    "differentiation", "adoption_barriers", "second_order_effects", "option_scores", 
    "must_validate_before_commitment", "top_risk_or_concern", "assumptions", 
    "evidence_gaps", "confidence"
  ]
};

const PLATFORM_STRATEGY_AGENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    agent_name: { type: Type.STRING },
    summary: { type: Type.STRING },
    technical_summary: { type: Type.STRING },
    option_analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          option: { type: Type.STRING },
          platform_fit: { type: Type.STRING, enum: ["high", "medium", "low", "unknown"] },
          reusability: { type: Type.STRING, enum: ["high", "medium", "low"] },
          integration_complexity: { type: Type.STRING, enum: ["high", "medium", "low"] },
          scalability: { type: Type.STRING, enum: ["high", "medium", "low"] },
          maintainability: { type: Type.STRING, enum: ["high", "medium", "low"] },
          operational_ownership: { type: Type.STRING },
          technical_debt_risk: { type: Type.STRING, enum: ["high", "medium", "low"] },
          score: { type: Type.NUMBER },
          rationale: { type: Type.STRING }
        },
        required: [
          "option", "platform_fit", "reusability", "integration_complexity", 
          "scalability", "maintainability", "operational_ownership", 
          "technical_debt_risk", "score", "rationale"
        ]
      }
    },
    architecture_implications: { type: Type.ARRAY, items: { type: Type.STRING } },
    dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
    technical_unknowns: { type: Type.ARRAY, items: { type: Type.STRING } },
    reversibility_assessment: { type: Type.STRING },
    recommended_technical_direction: { type: Type.STRING },
    top_risk_or_concern: { type: Type.STRING },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    evidence_gaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          why_it_matters: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["high", "medium", "low"] }
        },
        required: ["item", "why_it_matters", "impact"]
      }
    },
    confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
  },
  required: [
    "agent_name", "summary", "technical_summary", "option_analysis", 
    "architecture_implications", "dependencies", "technical_unknowns", 
    "reversibility_assessment", "recommended_technical_direction", 
    "top_risk_or_concern", "assumptions", "evidence_gaps", "confidence"
  ]
};

const FINANCIAL_IMPACT_AGENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    agent_name: { type: Type.STRING },
    summary: { type: Type.STRING },
    financial_summary: { type: Type.STRING },
    option_analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          option: { type: Type.STRING },
          investment_level: { type: Type.STRING, enum: ["high", "medium", "low", "unknown"] },
          time_to_value: { type: Type.STRING, enum: ["short", "medium", "long", "unknown"] },
          expected_benefit: { type: Type.STRING },
          opportunity_cost: { type: Type.STRING },
          operating_impact: { type: Type.STRING },
          payback_confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
          score: { type: Type.NUMBER },
          rationale: { type: Type.STRING }
        },
        required: [
          "option", "investment_level", "time_to_value", "expected_benefit", 
          "opportunity_cost", "operating_impact", "payback_confidence", 
          "score", "rationale"
        ]
      }
    },
    key_assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    missing_financial_inputs: { type: Type.ARRAY, items: { type: Type.STRING } },
    strategic_value_not_captured_by_financials: { type: Type.ARRAY, items: { type: Type.STRING } },
    minimum_evidence_needed: { type: Type.ARRAY, items: { type: Type.STRING } },
    top_risk_or_concern: { type: Type.STRING },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    evidence_gaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          why_it_matters: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["high", "medium", "low"] }
        },
        required: ["item", "why_it_matters", "impact"]
      }
    },
    confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
  },
  required: [
    "agent_name", "summary", "financial_summary", "option_analysis", 
    "key_assumptions", "missing_financial_inputs", 
    "strategic_value_not_captured_by_financials", "minimum_evidence_needed", 
    "top_risk_or_concern", "assumptions", "evidence_gaps", "confidence"
  ]
};

const RISK_GOVERNANCE_AGENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    agent_name: { type: Type.STRING },
    summary: { type: Type.STRING },
    risk_summary: { type: Type.STRING },
    risk_register: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["privacy", "compliance", "security", "operational", "adoption", "financial", "model", "vendor", "execution"] },
          severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
          likelihood: { type: Type.STRING, enum: ["high", "medium", "low", "unknown"] },
          mitigation: { type: Type.STRING },
          requires_human_review: { type: Type.BOOLEAN },
          residual_risk: { type: Type.STRING, enum: ["high", "medium", "low"] }
        },
        required: ["risk", "type", "severity", "likelihood", "mitigation", "requires_human_review", "residual_risk"]
      }
    },
    governance_controls: { type: Type.ARRAY, items: { type: Type.STRING } },
    human_in_the_loop_requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    auditability_requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    red_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
    option_risk_scores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          option: { type: Type.STRING },
          risk_level: { type: Type.STRING, enum: ["high", "medium", "low"] },
          rationale: { type: Type.STRING }
        },
        required: ["option", "risk_level", "rationale"]
      }
    },
    top_risk_or_concern: { type: Type.STRING },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    evidence_gaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          why_it_matters: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["high", "medium", "low"] }
        },
        required: ["item", "why_it_matters", "impact"]
      }
    },
    confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
  },
  required: [
    "agent_name", "summary", "risk_summary", "risk_register", 
    "governance_controls", "human_in_the_loop_requirements", 
    "auditability_requirements", "red_flags", "option_risk_scores", 
    "top_risk_or_concern", "assumptions", "evidence_gaps", "confidence"
  ]
};

const AGENT_ANALYSIS_PROPERTIES = {
  summary: { type: Type.STRING },
  details: { type: Type.ARRAY, items: { type: Type.STRING } },
  assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
  evidence_gaps: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        item: { type: Type.STRING },
        why_it_matters: { type: Type.STRING },
        impact: { type: Type.STRING, enum: ["high", "medium", "low"] }
      }
    }
  },
  top_risk: { type: Type.STRING },
  confidence_rationale: { type: Type.STRING },
  confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
};

const AGENT_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: AGENT_ANALYSIS_PROPERTIES,
  required: ["summary", "details", "assumptions", "evidence_gaps", "top_risk", "confidence"]
};

const MEMO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    body: { type: Type.STRING }
  },
  required: ["body"]
};

const EMAIL_MEMO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    email_body: {
      type: Type.OBJECT,
      properties: {
        opening: { type: Type.STRING },
        executive_summary: { type: Type.STRING },
        recommendation: { type: Type.STRING },
        confidence: { type: Type.STRING },
        key_tradeoffs: { type: Type.ARRAY, items: { type: Type.STRING } },
        critical_assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        risks_and_mitigations: { type: Type.ARRAY, items: { type: Type.STRING } },
        next_30_days: { type: Type.ARRAY, items: { type: Type.STRING } },
        kill_or_reconsider_criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
        closing: { type: Type.STRING }
      },
      required: [
        "opening", "executive_summary", "recommendation", "confidence", 
        "key_tradeoffs", "critical_assumptions", "risks_and_mitigations", 
        "next_30_days", "kill_or_reconsider_criteria", "closing"
      ]
    },
    plain_text_email: { type: Type.STRING }
  },
  required: ["subject", "email_body", "plain_text_email"]
};

// Framing Agent returns the structural frame + analysis
const FRAMING_AGENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    decision_statement: { type: Type.STRING },
    decision_type: { 
      type: Type.STRING, 
      enum: ["build_buy_partner_defer", "prioritization", "investment", "roadmap", "operating_model", "other"] 
    },
    reversibility: { type: Type.STRING, enum: ["high", "medium", "low"] },
    decision_risk_level: { type: Type.STRING, enum: ["high", "medium", "low"] },
    analysis: AGENT_ANALYSIS_SCHEMA
  },
  required: ["decision_statement", "decision_type", "reversibility", "decision_risk_level", "analysis"]
};

const GLOBAL_SYSTEM_PROMPT = `You are part of Strategic Decision OS, a multi-agent decision support system for senior product, platform, and business leaders.

Your role is to support structured decision-making, not to replace human judgment.

Global rules:
1. Use only the information provided in the user input, prior agent outputs, and grounding notes.
2. Do not invent facts, market statistics, customer evidence, financial figures, regulatory conclusions, or competitor claims.
3. Clearly separate facts, assumptions, constraints, risks, and missing information.
4. Use ranges or qualitative estimates instead of false precision unless exact numbers are provided.
5. If evidence is weak or missing, say so explicitly.
6. If confidence is low, explain why.
7. Do not force a recommendation when evidence is insufficient.
8. For regulated domains such as healthcare, do not provide legal, clinical, compliance, or regulatory certainty. Identify risks and recommend expert review where appropriate.
9. Apply structured reasoning using relevant business and product mental models such as opportunity cost, reversibility, second-order effects, risk-adjusted return, inversion, and platform leverage.
10. Keep the output concise, executive-ready, and decision-oriented.
11. Return only valid JSON matching the requested schema.`;

const SYSTEM_PROMPT = `${GLOBAL_SYSTEM_PROMPT}

Your job is to convert an ambiguous strategic decision into a clear decision structure analyzed by 5 specialized agents:

1. Framing Agent: Reframes the decision, identifies its type and reversibility.
2. Product & Market Agent: Analyzes market fit, customer needs, and competitive landscape.
3. Platform Strategy Agent: Evaluates technical feasibility, scalability, and technical debt.
4. Financial Impact Agent: Assesses ROI, opportunity costs, and investment requirements.
5. Risk & Governance Agent: Analyzes compliance, regulatory needs, and second-order risks.

For EACH agent, provide:
- A 2-line summary.
- List of structured findings (details).
- List of critical assumptions.
- Evidence gaps identified.
- The single top risk or concern.
- Confidence rationale and level.

Do not recommend an option yet. Just analyze the current state.`;

const RECOMMENDATION_SYSTEM_PROMPT = `${GLOBAL_SYSTEM_PROMPT}

You are the Executive Synthesis Agent.

Your job is to synthesize all prior analyses into a clear executive recommendation.

Do not blindly average scores.
Use judgment based on strategic priority, risk appetite, evidence quality, reversibility, and platform leverage.
If evidence is insufficient, say so clearly and recommend the next validation step instead of forcing a decision.

Apply these mental models implicitly:
- Reversibility
- Opportunity cost
- Risk-adjusted return
- Second-order effects
- Inversion
- Platform leverage`;

async function runAgentCall(prompt: string, schema: any, modelName: string = "gemini-3-flash-preview"): Promise<any> {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const text = response.text;
  
  if (!text) {
    throw new Error("Empty response from AI Agent");
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from Agent", text);
    throw new Error("Malformed JSON response from Agent");
  }
}

export async function runDecisionFramingAgent(input: DecisionInput): Promise<any> {
    const prompt = `${GLOBAL_SYSTEM_PROMPT}

You are the Decision Framing Agent. Your job is to reframe the user's input into a clear strategic decision structure.

Tasks:
1. Decision Statement: Reframe the input question into a high-stakes, clear decision statement.
2. Decision Type: Categorize the decision (build_buy_partner_defer, prioritization, investment, etc.).
3. Reversibility: Determine if this is a Type 1 (irreversible) or Type 2 (reversible) decision.
4. Risk Level: Assess the inherent risk of the decision context itself.
5. Analysis:
   - Summary: Use the reframed Decision Statement as the summary.
   - Details: Key structural attributes and context.
   - Assumptions: Critical assumptions identified in the problem framing.
   - Evidence Gaps: Missing information required to frame this decision with confidence.
   - Top Risk: The single biggest structural risk in this framing.
   - Confidence: Qualitative confidence level in this framing structure.

INPUT:
${JSON.stringify(input, null, 2)}
`;
  const result = await runAgentCall(prompt, FRAMING_AGENT_SCHEMA);
  return {
    ...result,
    analysis: {
        ...result.analysis,
        rawResult: result
    }
  };
}

export async function runProductMarketAgent(input: DecisionInput): Promise<any> {
  const prompt = `${GLOBAL_SYSTEM_PROMPT}

You are the Product & Market Agent.

Your job is to evaluate the product and market attractiveness of the decision.

Do not make unsupported market claims.
Do not invent customer evidence.
Separate customer pain, buyer urgency, adoption risk, and differentiation.
If evidence is missing, label it clearly.

Apply these mental models implicitly:
- Customer pull vs internal push
- Opportunity cost
- Second-order effects
- Inversion: why might customers not adopt this?

INPUT:
${JSON.stringify(input, null, 2)}
`;

  const result = await runAgentCall(prompt, PRODUCT_MARKET_AGENT_SCHEMA);
  
  // Map specialized schema back to generic UI findings
  return {
    summary: result.summary,
    details: [
      `Pain Severity: ${result.customer_need_assessment.pain_severity}`,
      `Buyer Urgency: ${result.customer_need_assessment.buyer_urgency}`,
      `Market Timing: ${result.market_attractiveness.timing}`,
      `Differentiation Basis: ${result.differentiation.basis}`,
      `Candidate Barriers: ${result.adoption_barriers.slice(0, 2).join(", ")}`,
      ...result.second_order_effects.map((e: string) => `2nd Order: ${e}`)
    ],
    assumptions: result.assumptions,
    evidence_gaps: result.evidence_gaps,
    top_risk: result.top_risk_or_concern,
    confidence_rationale: result.customer_need_assessment.rationale,
    confidence: result.confidence,
    rawResult: result
  };
}

export async function runPlatformStrategyAgent(input: DecisionInput, frame: DecisionFrame, pmOutput?: any): Promise<any> {
  const prompt = `${GLOBAL_SYSTEM_PROMPT}

You are the Platform & Technical Strategy Agent.

Your job is to evaluate the technical and platform implications of each option.

Focus on reusable platform capability, integration complexity, scalability, maintainability, operational ownership, and technical debt.

Do not over-recommend building unless there is clear strategic leverage.

Apply these mental models implicitly:
- Platform leverage: reusable primitive vs one-off solution
- Build/buy/partner trade-off
- Second-order effects
- Technical debt compounding
- Reversibility

INPUT:
${JSON.stringify(input, null, 2)}

DECISION FRAME:
${JSON.stringify(frame, null, 2)}

${pmOutput ? `PRODUCT & MARKET ANALYSIS:
${JSON.stringify(pmOutput, null, 2)}` : ""}
`;

  const result = await runAgentCall(prompt, PLATFORM_STRATEGY_AGENT_SCHEMA);

  return {
    summary: result.summary,
    details: [
      `Direction: ${result.recommended_technical_direction}`,
      `Tech Summary: ${result.technical_summary}`,
      ...result.architecture_implications.map((i: string) => `Arch: ${i}`),
      ...result.dependencies.map((d: string) => `Dep: ${d}`),
      `Reversibility: ${result.reversibility_assessment}`
    ],
    assumptions: result.assumptions,
    evidence_gaps: result.evidence_gaps,
    top_risk: result.top_risk_or_concern,
    confidence: result.confidence,
    rawResult: result
  };
}

export async function runFinancialImpactAgent(input: DecisionInput, frame: DecisionFrame, pmOutput?: any, psOutput?: any): Promise<any> {
  const prompt = `${GLOBAL_SYSTEM_PROMPT}

You are the Financial & Operating Impact Agent.

Your job is to evaluate investment effort, expected return, operating impact, and opportunity cost.

Do not invent financial numbers.
Use ranges and qualitative estimates unless numbers are provided.
Separate measurable financial impact from strategic value.

Apply these mental models implicitly:
- Opportunity cost
- Risk-adjusted return
- Marginal investment vs marginal value
- Time-to-value
- Operating leverage

INPUT:
${JSON.stringify(input, null, 2)}

DECISION FRAME:
${JSON.stringify(frame, null, 2)}

${pmOutput ? `PRODUCT & MARKET ANALYSIS:
${JSON.stringify(pmOutput, null, 2)}` : ""}

${psOutput ? `PLATFORM STRATEGY ANALYSIS:
${JSON.stringify(psOutput, null, 2)}` : ""}
`;

  const result = await runAgentCall(prompt, FINANCIAL_IMPACT_AGENT_SCHEMA);

  return {
    summary: result.summary,
    details: [
      `Financial Summary: ${result.financial_summary}`,
      ...result.option_analysis.map((opt: any) => `${opt.option}: Inv=${opt.investment_level}, TTV=${opt.time_to_value}, ROI Conf=${opt.payback_confidence}`),
      ...result.strategic_value_not_captured_by_financials.map((v: string) => `Strategic Value: ${v}`),
      ...result.key_assumptions.map((a: string) => `Fin Assumption: ${a}`)
    ],
    assumptions: result.assumptions,
    evidence_gaps: result.evidence_gaps,
    top_risk: result.top_risk_or_concern,
    confidence: result.confidence,
    rawResult: result
  };
}

export async function runRiskGovernanceAgent(
  input: DecisionInput, 
  frame: DecisionFrame, 
  pmOutput?: any, 
  psOutput?: any, 
  fiOutput?: any
): Promise<any> {
  const prompt = `${GLOBAL_SYSTEM_PROMPT}

You are the Risk & Governance Agent.

Your job is to identify and prioritize risks, then recommend practical mitigations.

Do not provide legal, clinical, compliance, or regulatory certainty.
For healthcare or regulated domains, recommend expert review where appropriate.
Focus on controls, human review, auditability, privacy, explainability, and operational resilience.

Apply these mental models implicitly:
- Inversion: why would this fail?
- Pre-mortem thinking
- Risk-adjusted return
- Second-order effects
- Human-in-the-loop necessity

INPUT:
${JSON.stringify(input, null, 2)}

DECISION FRAME:
${JSON.stringify(frame, null, 2)}

${pmOutput ? `PRODUCT & MARKET ANALYSIS:
${JSON.stringify(pmOutput, null, 2)}` : ""}

${psOutput ? `PLATFORM STRATEGY ANALYSIS:
${JSON.stringify(psOutput, null, 2)}` : ""}

${fiOutput ? `FINANCIAL IMPACT ANALYSIS:
${JSON.stringify(fiOutput, null, 2)}` : ""}
`;

  const result = await runAgentCall(prompt, RISK_GOVERNANCE_AGENT_SCHEMA);

  return {
    summary: result.summary,
    details: [
      `Risk Summary: ${result.risk_summary}`,
      ...result.risk_register.map((r: any) => `${r.risk} (${r.type}): Sev=${r.severity}, Like=${r.likelihood}, Residual=${r.residual_risk}`),
      ...result.red_flags.map((f: any) => `RED FLAG: ${f}`),
      ...result.governance_controls.map((c: any) => `Control: ${c}`)
    ],
    assumptions: result.assumptions,
    evidence_gaps: result.evidence_gaps,
    top_risk: result.top_risk_or_concern,
    confidence: result.confidence,
    rawResult: result
  };
}

export async function runExecutiveSynthesisAgent(input: DecisionInput, frame: DecisionFrame): Promise<ExecutiveRecommendation> {
  const prompt = `${RECOMMENDATION_SYSTEM_PROMPT}

DECISION INPUT:
${JSON.stringify(input, null, 2)}

AGENT ANALYSES:
${JSON.stringify(frame.agents, null, 2)}
`;
  return runAgentCall(prompt, EXECUTIVE_SYNTHESIS_SCHEMA, "gemini-3.1-pro-preview");
}

export async function runPrepareEmailMemoAgent(recommendation: ExecutiveRecommendation): Promise<any> {
  const prompt = `${GLOBAL_SYSTEM_PROMPT}

You are the Email Memo Agent for Strategic Decision OS.

Your job is to convert the approved executive recommendation into a concise decision memo email.

Do not change the recommendation.
Do not introduce new analysis.
Do not add unsupported claims.
Preserve confidence level, assumptions, risks, trade-offs, next steps, and kill criteria.
Write for a senior executive audience.

RECOMMENDATION:
${JSON.stringify(recommendation, null, 2)}
`;
  return runAgentCall(prompt, EMAIL_MEMO_SCHEMA);
}
