export type DecisionType = 
  | "build_buy_partner_defer" 
  | "prioritization" 
  | "investment" 
  | "roadmap" 
  | "operating_model" 
  | "other";

export type Priority = "high" | "medium" | "low";
export type Reversibility = "high" | "medium" | "low";

export interface DecisionOption {
  name: string;
  description: string;
  assumptions: string[];
  known_benefits: string[];
  known_drawbacks: string[];
}

export interface DecisionCriterion {
  criterion: string;
  priority: Priority;
  why_it_matters: string;
}

export interface MissingInformation {
  item: string;
  why_it_matters: string;
  impact: Priority;
}

export interface RecommendedAnalysisPath {
  step: string;
  description: string;
}

export type Screen = "input" | "analysis" | "recommendation";

export interface ExecutiveRecommendation {
  executive_recommendation: {
    recommended_option: string;
    recommendation_type: 'commit' | 'validate_first' | 'defer' | 'reject' | 'hybrid';
    summary: string;
    confidence: Priority;
  };
  why_this_recommendation: string[];
  rejected_alternatives: {
    option: string;
    why_not_selected: string;
  }[];
  key_tradeoffs: {
    tradeoff: string;
    implication: string;
    stakeholder_most_affected: 'product' | 'engineering' | 'finance' | 'legal' | 'GTM' | 'customer' | 'executive';
  }[];
  critical_assumptions: {
    assumption: string;
    status: 'accepted' | 'weak' | 'needs_validation';
    validation_action: string;
  }[];
  evidence_gaps: string[];
  risks_and_mitigations: {
    risk: string;
    mitigation: string;
    severity: Priority;
  }[];
  what_would_change_the_decision: string[];
  next_30_days: {
    action: string;
    owner: 'product' | 'engineering' | 'design' | 'finance' | 'legal' | 'GTM' | 'executive';
    desired_output: string;
    success_measure: string;
  }[];
  kill_or_reconsider_criteria: {
    criterion: string;
    threshold: string;
    review_timing: string;
    decision_owner: string;
  }[];
  decision_quality_assessment: {
    evidence_quality: 'strong' | 'moderate' | 'weak';
    reversibility: Priority;
    risk_adjusted_attractiveness: Priority;
    platform_leverage: Priority;
  };
  final_boardroom_summary: string;
}

export type AgentID = 
  | "framing" 
  | "product_market" 
  | "platform_strategy" 
  | "financial" 
  | "risk_governance";

export interface EvidenceGap {
  item: string;
  why_it_matters: string;
  impact: Priority;
}

export interface AgentFindings {
  summary: string;
  details: string[];
  assumptions: string[];
  evidence_gaps: EvidenceGap[];
  top_risk: string;
  confidence_rationale: string;
  confidence: Priority;
}

export type RunMode = "guided_review" | "autonomous_hitl";

export interface AgentAnalysis extends AgentFindings {
  id: AgentID;
  status: 
    | "not_run" 
    | "running"
    | "completed"
    | "review_required" 
    | "edited"
    | "rerun_needed"
    | "accepted"
    | "skipped_with_caveat"
    | "blocked"
    | "failed";
  user_notes?: string;
  rawResult?: any;
}

export interface DecisionFrame {
  decision_statement: string;
  decision_type: DecisionType;
  agents: Record<AgentID, AgentAnalysis>;
  reversibility: Reversibility;
  decision_risk_level: Priority;
  run_mode: RunMode;
}

export interface DecisionInput {
  decision_question: string;
  industry_domain: string;
  business_objective: string;
  options: string;
  target_customer: string;
  platform_context: string;
  constraints: string;
  success_metrics: string;
  known_risks: string;
  risk_appetite: string;
  strategic_priority: string;
  grounding_notes?: string;
}
