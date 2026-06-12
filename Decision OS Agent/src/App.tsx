import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Layers, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Info,
  ChevronRight,
  BrainCircuit,
  Maximize2,
  Trash2,
  ArrowLeft,
  Briefcase,
  GitBranch,
  ShieldCheck,
  Rocket,
  X,
  RefreshCw,
  MoreHorizontal,
  FileText,
  Activity,
  Mail,
  Send,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  runDecisionFramingAgent,
  runProductMarketAgent,
  runPlatformStrategyAgent,
  runFinancialImpactAgent,
  runRiskGovernanceAgent,
  runExecutiveSynthesisAgent,
  runPrepareEmailMemoAgent
} from './services/geminiService';
import { DecisionInput, DecisionFrame, ExecutiveRecommendation, Screen, AgentID, AgentAnalysis, RunMode } from './types';

const INITIAL_INPUT: DecisionInput = {
  decision_question: "Should an enterprise healthcare AI platform build its own agent orchestration layer, partner with a hyperscaler, or adopt a hybrid approach?",
  industry_domain: "Healthcare technology, regulated enterprise SaaS.",
  business_objective: "Reduce time-to-market for agentic healthcare workflows while maintaining governance, integration flexibility, and compliance readiness.",
  options: "1. Build internal orchestration layer, 2. Partner with hyperscaler agent platform, 3. Hybrid approach",
  target_customer: "Healthcare provider operations teams, care coordinators, implementation teams, and internal product teams.",
  platform_context: "The platform already supports workflow automation, integrations, and human-in-the-loop review, but does not yet have a mature agent orchestration abstraction layer.",
  constraints: "Limited engineering capacity, regulated customer environments, auditability requirements, existing cloud partnerships, and 6-12 month decision horizon.",
  success_metrics: "Time-to-market, workflow reuse, implementation cost, customer adoption, governance quality, integration flexibility.",
  known_risks: "Vendor lock-in, compliance gaps, orchestration complexity, unclear ROI, customer demand uncertainty.",
  risk_appetite: "Medium.",
  strategic_priority: "Speed and platform leverage, while preserving compliance.",
  grounding_notes: "Do not assume market size or customer demand beyond what is provided. Treat healthcare healthcare compliance as a risk area requiring expert review, not as something the AI can certify."
};

const AGENT_CONFIG: Record<AgentID, { name: string, icon: any }> = {
  framing: { name: "Decision Framing", icon: BrainCircuit },
  product_market: { name: "Product & Market", icon: Users },
  platform_strategy: { name: "Platform Strategy", icon: Cpu },
  financial: { name: "Financial Impact", icon: TrendingUp },
  risk_governance: { name: "Risk & Governance", icon: ShieldAlert }
};

const InputField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  icon: Icon, 
  placeholder,
  textarea = false 
}: { 
  label: string, 
  name: keyof DecisionInput, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  icon: any,
  placeholder?: string,
  textarea?: boolean
}) => (
  <div className="mb-6">
    <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
      <Icon size={12} />
      {label}
    </label>
    {textarea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all min-h-[100px] resize-none"
      />
    ) : (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
      />
    )}
  </div>
);

const Section = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) => (
  <div className="mb-10">
    {title && (
      <h3 className="flex items-center gap-2 text-xs font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2 uppercase tracking-wider">
        {Icon && <Icon size={14} />}
        {title}
      </h3>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning' }) => {
  const styles = {
    default: "bg-zinc-100 text-zinc-600",
    high: "bg-red-50 text-red-700 border border-red-100",
    medium: "bg-amber-50 text-amber-700 border border-amber-100",
    low: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    info: "bg-blue-50 text-blue-700 border border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-orange-50 text-orange-700 border border-orange-100"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default function App() {
  const [input, setInput] = useState<DecisionInput>(INITIAL_INPUT);
  const [frame, setFrame] = useState<DecisionFrame | null>(null);
  const [recommendation, setRecommendation] = useState<ExecutiveRecommendation | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentID | null>(null);
  const [selectedRecSection, setSelectedRecSection] = useState<keyof ExecutiveRecommendation | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("input");
  const [loading, setLoading] = useState(false);

  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overrideGaps, setOverrideGaps] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const [showEmailDrawer, setShowEmailDrawer] = useState(false);
  const [memoTab, setMemoTab] = useState<'preview' | 'edit'>('preview');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; simulated?: boolean; message?: string } | null>(null);
  const [runMode, setRunMode] = useState<RunMode>("autonomous_hitl");
  const [hitlPause, setHitlPause] = useState<{ agentId: AgentID | 'recommendation', reasons: string[] } | null>(null);
  const [emailData, setEmailData] = useState({
    to: "executive-leadership@company.com",
    cc: "strategy-ops@company.com",
    subject: "",
    body: "",
    memo: null as any
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
  };

  const checkHITL = (agentId: AgentID | 'recommendation', result: any): string[] => {
    const reasons: string[] = [];
    
    if (agentId === 'framing') {
      const data = result.rawResult || result;
      if (data.analysis?.confidence === 'low') reasons.push("Confidence is low");
      if (data.decision_risk_level === 'high') reasons.push("Decision risk level is high");
      if (!input.business_objective || input.business_objective.trim().length === 0) reasons.push("Business objective is missing");
      if (!input.success_metrics || input.success_metrics.trim().length === 0) reasons.push("Success metrics are missing");
      if (data.analysis?.evidence_gaps?.some((g: any) => g.impact === 'high')) reasons.push("High-impact evidence gaps identified");
      
      // Heuristic for options count
      const optionsCount = input.options.split('\n').filter(l => l.trim().length > 0).length;
      if (optionsCount < 2) reasons.push("Fewer than 2 decision options provided");
    }

    if (agentId === 'product_market') {
      const raw = result.rawResult;
      if (raw.confidence === 'low') reasons.push("Confidence is low");
      if (raw.customer_need_assessment.evidence_quality === 'missing' || raw.customer_need_assessment.evidence_quality === 'weak') reasons.push("Evidence quality is missing or weak");
      if (raw.customer_need_assessment.buyer_urgency === 'unknown') reasons.push("Buyer urgency is unknown");
      if (raw.customer_need_assessment.pain_severity === 'unknown') reasons.push("Pain severity is unknown");
      if (raw.must_validate_before_commitment && raw.must_validate_before_commitment.length > 0) reasons.push("Must validate critical items before commitment");
    }

    if (agentId === 'platform_strategy') {
      const raw = result.rawResult;
      if (raw.confidence === 'low') reasons.push("Confidence is low");
      if (raw.option_analysis.some((opt: any) => opt.integration_complexity === 'high' || opt.technical_debt_risk === 'high')) reasons.push("High complexity or technical debt risk detected");
      if (raw.option_analysis.some((opt: any) => opt.platform_fit === 'unknown')) reasons.push("Platform fit is unknown for some options");
      if (raw.technical_unknowns && raw.technical_unknowns.length > 0) reasons.push("Significant technical unknowns identified");
    }

    if (agentId === 'financial') {
      const raw = result.rawResult;
      if (raw.confidence === 'low') reasons.push("Confidence is low");
      if (raw.option_analysis.some((opt: any) => opt.investment_level === 'unknown')) reasons.push("Investment level is unknown");
      if (raw.option_analysis.some((opt: any) => opt.payback_confidence === 'low')) reasons.push("Payback confidence is low");
      if (raw.missing_financial_inputs && raw.missing_financial_inputs.length > 0) reasons.push("Missing financial inputs");
      if (raw.option_analysis.some((opt: any) => !opt.opportunity_cost)) reasons.push("Opportunity cost is unclear");
    }

    if (agentId === 'risk_governance') {
      const raw = result.rawResult;
      if (raw.risk_register.some((r: any) => r.severity === 'high')) reasons.push("High-severity risks detected");
      if (raw.red_flags && raw.red_flags.length > 0) reasons.push("Red flags identified");
      if (raw.risk_register.some((r: any) => r.requires_human_review)) reasons.push("Human review required for specific risks");
      if (raw.risk_register.some((r: any) => r.residual_risk === 'high')) reasons.push("High residual risk detected");
      
      const regulatedTerms = ['healthcare', 'medical', 'financial', 'banking', 'pharma', 'compliance', 'legal', 'audit'];
      const isRegulated = regulatedTerms.some(term => input.industry_domain.toLowerCase().includes(term));
      if (isRegulated && raw.governance_controls.length < 2) reasons.push("Regulated domain detected with incomplete governance controls");
    }

    if (agentId === 'recommendation') {
      const raw = result; // Recommendation is already raw ExecutiveRecommendation
      if (raw.executive_recommendation.confidence === 'low') reasons.push("Recommendation confidence is low");
      if (raw.executive_recommendation.recommendation_type === 'commit' && raw.decision_quality_assessment.evidence_quality === 'weak') reasons.push("Commitment recommended but evidence quality is weak");
      if (raw.risks_and_mitigations.some((r: any) => r.severity === 'high')) reasons.push("Unresolved high-severity risks exist");
      if (raw.critical_assumptions.some((a: any) => a.status === 'needs_validation')) reasons.push("Critical assumptions require validation");
    }

    return reasons;
  };

  const handleClear = () => {
    setInput({
      decision_question: "",
      industry_domain: "",
      business_objective: "",
      options: "",
      target_customer: "",
      platform_context: "",
      constraints: "",
      success_metrics: "",
      known_risks: "",
      risk_appetite: "",
      strategic_priority: "",
      grounding_notes: ""
    });
    setFrame(null);
    setRecommendation(null);
    setCurrentScreen("input");
    setSelectedAgentId(null);
    setOverrideGaps(false);
  };

  const loadHealthcareDemo = () => {
    setInput({
      decision_question: "Should we build our own proprietary medical-grade LLM for cardiovascular diagnostics or partner with a vendor (Azure Health/OpenAI) and fine-tune their base models?",
      industry_domain: "HealthTech / Clinical Diagnostics",
      business_objective: "Establish 1st-mover advantage in AI-driven ECG interpretation while maintaining 99.9% recall on critical heart conditions.",
      options: "1. Build proprietary architecture from scratch (High TTM, full control). 2. Partner with Azure/OpenAI (Fast TTM, high vendor lock-in). 3. Hybrid: On-prem execution of fine-tuned open-source models (Llama-3).",
      target_customer: "Tier-1 Academic Medical Centers and Hospital Networks.",
      platform_context: "Existing rule-based pipeline for ECG data; move to multi-modal transformer architecture.",
      constraints: "HIPAA compliance, FDA Class III clearance path, on-prem deployment requirement for some data-sovereign customers.",
      success_metrics: "Clinical accuracy (>99.5%), Integration speed (<6 months), Operational cost per scan (<$1.00).",
      known_risks: "Data privacy leaks, Hallucinations in diagnostics, FDA regulatory rejection, High compute cost.",
      risk_appetite: "Low (Conservative due to life-safety implications)",
      strategic_priority: "Accuracy and Regulatory Compliance",
      grounding_notes: "Initial pilot data shows open-source models underperform on rare arrhythmias without significant medical fine-tuning."
    });
  };

  const runWorkflowStep = async (id: AgentID, updatedFrame: DecisionFrame) => {
    // 1. Set Status Running
    setFrame(prev => prev ? ({ 
      ...prev, 
      agents: { ...prev.agents, [id]: { ...prev.agents[id], status: 'running' } } 
    }) : null);

    // 2. Run logic based on ID
    let result;
    const pmResult = updatedFrame.agents.product_market?.rawResult;
    const psResult = updatedFrame.agents.platform_strategy?.rawResult;
    const fiResult = updatedFrame.agents.financial?.rawResult;

    try {
      if (id === 'product_market') result = await runProductMarketAgent(input);
      else if (id === 'platform_strategy') result = await runPlatformStrategyAgent(input, updatedFrame, pmResult);
      else if (id === 'financial') result = await runFinancialImpactAgent(input, updatedFrame, pmResult, psResult);
      else if (id === 'risk_governance') result = await runRiskGovernanceAgent(input, updatedFrame, pmResult, psResult, fiResult);
      
      if (!result) return false;

      // 3. Check HITL
      const hitlReasons = checkHITL(id, result);
      const status = (runMode === 'guided_review' || hitlReasons.length > 0) ? 'review_required' : 'accepted';

      const newAgentState = { ...result, status, id, user_notes: "" };
      const nextFrame = {
        ...updatedFrame,
        agents: { ...updatedFrame.agents, [id]: newAgentState }
      };
      
      setFrame(nextFrame);

      if (status === 'review_required') {
        setHitlPause({ agentId: id, reasons: hitlReasons });
        return false; 
      }
      return nextFrame;
    } catch (err) {
      console.error(`Error running ${id}:`, err);
      setFrame(prev => prev ? ({ 
        ...prev, 
        agents: { ...prev.agents, [id]: { ...prev.agents[id], status: 'failed' } } 
      }) : null);
      return false;
    }
  };

  const startAnalysis = async () => {
    setLoading(true);
    setError(null);
    setHitlPause(null);
    try {
      // 1. Run Framing Agent
      const framingResult = await runDecisionFramingAgent(input);
      const framingHitl = checkHITL('framing', framingResult);
      const framingStatus = (runMode === 'guided_review' || framingHitl.length > 0) ? 'review_required' : 'accepted';

      const initialAgents: Record<AgentID, AgentAnalysis> = {
        framing: { ...framingResult.analysis, status: framingStatus, id: "framing", user_notes: "" },
        product_market: { id: "product_market", status: "not_run", summary: "", details: [], assumptions: [], evidence_gaps: [], top_risk: "", confidence_rationale: "", confidence: "medium" } as AgentAnalysis,
        platform_strategy: { id: "platform_strategy", status: "not_run", summary: "", details: [], assumptions: [], evidence_gaps: [], top_risk: "", confidence_rationale: "", confidence: "medium" } as AgentAnalysis,
        financial: { id: "financial", status: "not_run", summary: "", details: [], assumptions: [], evidence_gaps: [], top_risk: "", confidence_rationale: "", confidence: "medium" } as AgentAnalysis,
        risk_governance: { id: "risk_governance", status: "not_run", summary: "", details: [], assumptions: [], evidence_gaps: [], top_risk: "", confidence_rationale: "", confidence: "medium" } as AgentAnalysis,
      };

      const initialFrame: DecisionFrame = {
        decision_statement: framingResult.decision_statement,
        decision_type: framingResult.decision_type,
        reversibility: framingResult.reversibility,
        decision_risk_level: framingResult.decision_risk_level,
        agents: initialAgents,
        run_mode: runMode
      };

      setFrame(initialFrame);
      setCurrentScreen("analysis");

      if (framingStatus === 'review_required') {
        setHitlPause({ agentId: 'framing', reasons: framingHitl });
        setLoading(false);
        return;
      }

      // Sequential run
      let currentFrame: any = initialFrame;
      const ids: AgentID[] = ['product_market', 'platform_strategy', 'financial', 'risk_governance'];
      
      for (const id of ids) {
        currentFrame = await runWorkflowStep(id, currentFrame);
        if (!currentFrame) break;
      }

      // Auto-trigger Synthesis if all completed and autonomous
      if (currentFrame && runMode === 'autonomous_hitl') {
          const allowed: AgentAnalysis['status'][] = ['accepted', 'skipped_with_caveat', 'completed', 'edited'];
          const allValid = (Object.values(currentFrame.agents) as AgentAnalysis[]).every(a => allowed.includes(a.status));
          if (allValid) {
              await startRecommendation(currentFrame);
          }
      }

    } catch (err) {
      setError("Failed to generate strategic analysis frame.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resumeWorkflow = async () => {
    if (!frame || !hitlPause) return;
    
    setLoading(true);
    const pausedId = hitlPause.agentId;
    setHitlPause(null);

    if (pausedId === 'recommendation') {
        setLoading(false);
        return;
    }
    
    // Resume from where we left off
    const ids: AgentID[] = ['framing', 'product_market', 'platform_strategy', 'financial', 'risk_governance'];
    const startIndex = ids.indexOf(pausedId as AgentID);
    
    let currentFrame: any = frame;
    
    // First, complete the current paused agent as 'accepted'
    currentFrame = {
      ...currentFrame,
      agents: {
        ...currentFrame.agents,
        [pausedId]: { ...currentFrame.agents[pausedId as AgentID], status: 'accepted' }
      }
    };
    setFrame(currentFrame);

    // Then run the rest
    for (let i = startIndex + 1; i < ids.length; i++) {
      currentFrame = await runWorkflowStep(ids[i], currentFrame);
      if (!currentFrame) break;
    }

    // Auto-trigger Synthesis if reached the end and autonomous
    if (currentFrame && runMode === 'autonomous_hitl') {
        const allowed: AgentAnalysis['status'][] = ['accepted', 'skipped_with_caveat', 'completed', 'edited'];
        const allValid = (Object.values(currentFrame.agents) as AgentAnalysis[]).every(a => allowed.includes(a.status));
        if (allValid) {
            await startRecommendation(currentFrame);
        }
    }

    setLoading(false);
  };

  const startRecommendation = async (overrideFrame?: DecisionFrame) => {
    const targetFrame = overrideFrame || frame;
    if (!targetFrame) return;
    setLoadingRecommendation(true);
    setLoading(true); // Also show main loading if auto-triggered
    setError(null);
    try {
      const result = await runExecutiveSynthesisAgent(input, targetFrame);
      
      // HITL for Recommendation
      const recHitl = checkHITL('recommendation', result);
      if (runMode === 'autonomous_hitl' && recHitl.length > 0) {
          setHitlPause({ agentId: 'recommendation', reasons: recHitl });
          // We don't switch screen yet if hitl? 
          // Actually, let's show the recommendation screen but with the HITL overlay
          setRecommendation(result);
          setCurrentScreen("recommendation");
      } else if (runMode === 'guided_review') {
          setRecommendation(result);
          setCurrentScreen("recommendation");
          setHitlPause({ agentId: 'recommendation', reasons: ["Review final synthesis and decision memo."] });
      } else {
          setRecommendation(result);
          setHasEdits(false);
          setCurrentScreen("recommendation");
      }
    } catch (err) {
      setError("Failed to generate executive recommendation.");
      console.error(err);
    } finally {
      setLoadingRecommendation(false);
      setLoading(false);
    }
  };

  const handleRerunAgent = async (id: AgentID) => {
    if (!frame) return;
    setSelectedAgentId(null);
    setHitlPause(null);
    setLoading(true);
    await runWorkflowStep(id, frame);
    setLoading(false);
  };

  const skipWithCaveat = (id: AgentID) => {
    if (!frame) return;
    updateAgentStatus(id, 'skipped_with_caveat');
    setHitlPause(null);
    setSelectedAgentId(null);
    
    // Resume next
    const ids: AgentID[] = ['framing', 'product_market', 'platform_strategy', 'financial', 'risk_governance'];
    const nextIndex = ids.indexOf(id) + 1;
    if (nextIndex < ids.length) {
      resumeWorkflowAfterSkip(id);
    }
  };

  const resumeWorkflowAfterSkip = async (id: AgentID) => {
    const ids: AgentID[] = ['framing', 'product_market', 'platform_strategy', 'financial', 'risk_governance'];
    const nextIndex = ids.indexOf(id) + 1;
    let currentFrame: any = frame;
    for (let i = nextIndex; i < ids.length; i++) {
        currentFrame = await runWorkflowStep(ids[i], currentFrame);
        if (!currentFrame) break;
    }
  };

  const updateAgentStatus = (id: AgentID, status: AgentAnalysis['status']) => {
    if (!frame) return;
    setFrame({
      ...frame,
      agents: {
        ...frame.agents,
        [id]: { ...frame.agents[id], status }
      }
    });
  };

  const updateRecommendation = (updates: Partial<ExecutiveRecommendation>) => {
    if (!recommendation) return;
    setRecommendation({ ...recommendation, ...updates });
    setHasEdits(true);
  };

  const updateAgentNotes = (id: AgentID, notes: string) => {
    if (!frame) return;
    setFrame({
      ...frame,
      agents: {
        ...frame.agents,
        [id]: { ...frame.agents[id], user_notes: notes }
      }
    });
  };

  const exportMarkdown = () => {
    if (!recommendation) return;
    const md = `
# Executive Decision Memo: ${recommendation.executive_recommendation.recommended_option}

## 1. Recommendation
${recommendation.why_this_recommendation.join('\n- ')}

## 2. Confidence Level
Score: ${recommendation.executive_recommendation.confidence}
Summary: ${recommendation.executive_recommendation.summary}

## 3. Next 30 Days
${recommendation.next_30_days.map(s => `- ${s.action} (Owner: ${s.owner})`).join('\n')}

## 4. Risks & Mitigations
${recommendation.risks_and_mitigations.map(r => `- ${r.risk}: ${r.mitigation}`).join('\n')}
    `;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Strategic_OS_Recommendation_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const prepareEmailMemo = async () => {
    if (!recommendation) return;
    
    try {
      setLoadingRecommendation(true);
      const result = await runPrepareEmailMemoAgent(recommendation);

      setEmailData(prev => ({
        ...prev,
        subject: result.subject,
        body: result.plain_text_email,
        memo: result.email_body
      }));
      setShowEmailDrawer(true);
    } catch (err) {
      console.error("Memo Agent failed, falling back to static template", err);
      // Fallback logic
      const fallbackBody = `Subject: STRATEGIC MEMO: ${recommendation.executive_recommendation.recommended_option}

Executive Summary:
${recommendation.executive_recommendation.summary}

1. RATIONALE & LOGIC
${recommendation.why_this_recommendation.map(l => `• ${l}`).join('\n')}

2. CONFIDENCE & DATA QUALITY
Confidence Score: ${recommendation.executive_recommendation.confidence}

Best regards,
Strategic Decision OS synthesized recommendation.`;

      setEmailData(prev => ({
        ...prev,
        subject: `STRATEGIC MEMO: ${recommendation.executive_recommendation.recommended_option}`,
        body: fallbackBody,
        memo: null
      }));
      setShowEmailDrawer(true);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setSendResult(null);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body
        })
      });
      const data = await response.json();
      setSendResult(data);
      if (data.success) {
        setTimeout(() => {
          setShowEmailDrawer(false);
          setSendResult(null);
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to send email", err);
      setSendResult({ success: false, message: "Network error or server unavailable" });
    } finally {
      setSendingEmail(false);
    }
  };

  const copyEmailToClipboard = () => {
    const text = `To: ${emailData.to}\nCC: ${emailData.cc}\nSubject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(text);
    alert("Email memo copied to clipboard.");
  };

  const isSynthesisEnabled = useMemo(() => {
    if (!frame) return false;
    const allowedStatuses: AgentAnalysis['status'][] = ['accepted', 'skipped_with_caveat', 'completed', 'edited'];
    const allValid = (Object.values(frame.agents) as AgentAnalysis[]).every(a => allowedStatuses.includes(a.status));
    return allValid || overrideGaps;
  }, [frame, overrideGaps]);

  const getStatusBadge = (status: AgentAnalysis['status']) => {
    const variants: Record<string, any> = {
      not_run: 'default',
      running: 'info',
      completed: 'success',
      review_required: 'warning',
      edited: 'info',
      rerun_needed: 'warning',
      accepted: 'success',
      skipped_with_caveat: 'warning',
      blocked: 'high',
      failed: 'high'
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const selectedAgent = selectedAgentId && frame ? frame.agents[selectedAgentId] : null;

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Global Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-50 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded flex items-center justify-center text-white font-bold">OS</div>
          <div>
            <h1 className="text-sm font-bold leading-none">Strategic Decision OS</h1>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-1">Multi-Agent System</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-8">
          {[
            { id: 'input', label: '01 Context', icon: Target },
            { id: 'analysis', label: '02 Analysis', icon: BrainCircuit },
            { id: 'recommendation', label: '03 Executive', icon: Briefcase },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                currentScreen === s.id 
                  ? 'bg-zinc-900 text-white' 
                  : i < (currentScreen === 'input' ? 0 : currentScreen === 'analysis' ? 1 : 2)
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'bg-zinc-50 text-zinc-300'
              }`}>
                {i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentScreen === s.id ? 'text-zinc-900' : 'text-zinc-300'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleClear}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-900 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> Reset
          </button>
          <div className="h-4 w-[1px] bg-zinc-200" />
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading || loadingRecommendation ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {loading || loadingRecommendation ? 'Processing' : 'System Ready'}
            </span>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-4">
        <AnimatePresence mode="wait">
          {/* SCREEN 1: DECISION INPUT */}
          {currentScreen === "input" && (
            <motion.section 
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto py-12 px-6"
            >
              <div className="mb-12">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="info">Phase 01</Badge>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Grounding & Constraints</p>
                  </div>
                  <button 
                    onClick={loadHealthcareDemo}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
                  >
                    <Activity size={10} className="text-emerald-500" /> Load Healthcare Demo
                  </button>
                </div>
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Strategy Input</h2>
                <p className="text-sm text-zinc-500 mt-4 leading-relaxed max-w-2xl">
                  Populate the core parameters of the strategic decision. Strategic Decision OS uses this context to frame the problem using established mental models.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <div className="col-span-2 mb-8 p-6 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Run Mode Selection</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setRunMode('autonomous_hitl')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        runMode === 'autonomous_hitl' 
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' 
                          : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className={runMode === 'autonomous_hitl' ? 'text-amber-400' : 'text-zinc-400'} />
                        <span className="text-xs font-bold uppercase tracking-tight">Autonomous with HITL Gates</span>
                      </div>
                      <p className={`text-[10px] leading-relaxed ${runMode === 'autonomous_hitl' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        System runs sequentially, pausing only when critical Human-In-The-Loop conditions are met.
                      </p>
                    </button>
                    <button 
                      onClick={() => setRunMode('guided_review')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        runMode === 'guided_review' 
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' 
                          : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={14} className={runMode === 'guided_review' ? 'text-blue-400' : 'text-zinc-400'} />
                        <span className="text-xs font-bold uppercase tracking-tight">Guided Review Mode</span>
                      </div>
                      <p className={`text-[10px] leading-relaxed ${runMode === 'guided_review' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Mandatory manual review and acceptance for every agent output before final synthesis.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <InputField label="Decision Question" name="decision_question" value={input.decision_question} onChange={handleInputChange} icon={BrainCircuit} textarea placeholder="Critical strategic choice..." />
                </div>
                
                <InputField label="Industry / Domain" name="industry_domain" value={input.industry_domain} onChange={handleInputChange} icon={Layers} />
                <InputField label="Strategic Priority" name="strategic_priority" value={input.strategic_priority} onChange={handleInputChange} icon={Zap} />
                
                <div className="col-span-2">
                  <InputField label="Business Objective" name="business_objective" value={input.business_objective} onChange={handleInputChange} icon={TrendingUp} textarea />
                </div>

                <InputField label="Target Customer / User" name="target_customer" value={input.target_customer} onChange={handleInputChange} icon={Users} />
                <InputField label="Risk Appetite" name="risk_appetite" value={input.risk_appetite} onChange={handleInputChange} icon={ShieldAlert} />

                <div className="col-span-2">
                  <InputField label="Options Considered" name="options" value={input.options} onChange={handleInputChange} icon={Maximize2} textarea />
                </div>

                <InputField label="Technical / Platform Context" name="platform_context" value={input.platform_context} onChange={handleInputChange} icon={Cpu} textarea />
                <InputField label="Constraints" name="constraints" value={input.constraints} onChange={handleInputChange} icon={Lock} />
                
                <InputField label="Success Metrics" name="success_metrics" value={input.success_metrics} onChange={handleInputChange} icon={CheckCircle2} />
                <InputField label="Known Risks" name="known_risks" value={input.known_risks} onChange={handleInputChange} icon={ShieldAlert} />

                <div className="col-span-2">
                  <InputField label="Grounding Notes" name="grounding_notes" value={input.grounding_notes || ""} onChange={handleInputChange} icon={FileText} textarea placeholder="Assumptions, caveats, and data grounding..." />
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-end">
                <button
                  onClick={startAnalysis}
                  disabled={loading}
                  className="bg-zinc-900 text-white rounded-lg h-14 px-8 text-sm font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Initializing Multi-Agent OS...
                    </>
                  ) : (
                    <>
                      Execute Analysis <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.section>
          )}

          {/* SCREEN 2: AGENT ANALYSIS REVIEW */}
          {currentScreen === "analysis" && frame && (
            <motion.section 
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto py-12 px-6"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setCurrentScreen("input")}
                    className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="success">Engine Active</Badge>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Multi-Agent Review Required</p>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Agent Analysis Review</h2>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={overrideGaps} 
                        onChange={(e) => setOverrideGaps(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" 
                      />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">Proceed with unresolved gaps</span>
                    </label>
                    <button
                      onClick={startRecommendation}
                      disabled={!isSynthesisEnabled || loadingRecommendation}
                      className="bg-zinc-900 text-white rounded-xl h-12 px-6 text-xs font-bold hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                    >
                      {loadingRecommendation ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          Generate Executive Recommendation <ChevronRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                  {overrideGaps && !(Object.values(frame.agents) as AgentAnalysis[]).every(a => a.status === 'accepted') && (
                    <div className="flex items-center gap-2 text-orange-600 animate-pulse">
                      <AlertTriangle size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Confidence risk: Gaps unresolved</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {(Object.keys(AGENT_CONFIG) as AgentID[]).map((id) => {
                  const agent = frame.agents[id];
                  const config = AGENT_CONFIG[id];
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={id}
                      onClick={() => setSelectedAgentId(id)}
                      whileHover={{ y: -4 }}
                      className={`cursor-pointer rounded-2xl p-6 border transition-all relative ${
                        agent.status === 'accepted' || agent.status === 'completed'
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl' 
                          : agent.status === 'review_required'
                            ? 'bg-amber-50 border-amber-200 shadow-inner'
                            : 'bg-white border-zinc-200 hover:border-zinc-900 hover:shadow-lg'
                      }`}
                    >
                      {agent.status === 'running' && (
                        <div className="absolute top-6 right-6">
                           <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                        </div>
                      )}
                      {(agent.status === 'accepted' || agent.status === 'completed') && (
                        <div className="absolute top-6 right-6 text-emerald-400">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                      {agent.status === 'review_required' && (
                        <div className="absolute top-6 right-6 text-amber-600 animate-pulse">
                          <ShieldAlert size={18} />
                        </div>
                      )}
                      
                      <div className={`w-10 h-10 rounded-xl mb-6 flex items-center justify-center ${
                        (agent.status === 'accepted' || agent.status === 'completed') ? 'bg-white/10' : 'bg-zinc-100 text-zinc-900'
                      }`}>
                        <Icon size={20} />
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(agent.status)}
                          <Badge variant={agent.confidence}>
                            {agent.confidence} Confidence
                          </Badge>
                        </div>
                        <h4 className="font-bold text-lg mb-2">{config.name}</h4>
                        <p className={`text-xs leading-relaxed line-clamp-2 ${agent.status === 'accepted' || agent.status === 'completed' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {agent.summary || (agent.status === 'running' ? 'Agent analysis in progress...' : 'Waiting to start...')}
                        </p>
                      </div>

                      <div className={`grid grid-cols-2 gap-4 pt-6 border-t ${
                        agent.status === 'accepted' || agent.status === 'completed' ? 'border-white/10' : 'border-zinc-100'
                      }`}>
                        <div>
                          <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${agent.status === 'accepted' || agent.status === 'completed' ? 'text-white/40' : 'text-zinc-400'}`}>Findings</p>
                          <p className="text-xs font-bold">{(agent.details || []).length} points</p>
                        </div>
                        <div>
                          <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${agent.status === 'accepted' || agent.status === 'completed' ? 'text-white/40' : 'text-zinc-400'}`}>Assumptions</p>
                          <p className="text-xs font-bold">{(agent.assumptions || []).length} identified</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={12} className={agent.status === 'accepted' ? 'text-orange-400' : 'text-amber-500'} />
                          <span className={`text-[10px] font-bold truncate max-w-[120px] ${agent.status === 'accepted' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {agent.top_risk || 'No major risk reported'}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${agent.status === 'accepted' ? 'text-white/40' : 'text-zinc-300'}`}>
                          {(agent.evidence_gaps || []).length} Gaps <Info size={10} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Review Required / HITL Drawer */}
              <AnimatePresence>
                {hitlPause && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md z-[80] flex items-center justify-center p-6"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="bg-amber-50 p-8 border-b border-amber-100">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                              <ShieldAlert size={32} />
                            </div>
                            <div>
                              <Badge variant="warning">Human-In-The-Loop Gate</Badge>
                              <h3 className="text-2xl font-black text-zinc-900 mt-1">Review Required</h3>
                            </div>
                          </div>

                          <p className="text-sm font-bold text-amber-900 mb-2 uppercase tracking-widest">Trigger Conditions Met:</p>
                          <ul className="space-y-2">
                            {hitlPause.reasons.map((r, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-amber-800 leading-tight">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-8">
                          <div className="flex items-center gap-4 mb-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                             <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                               {React.createElement(AGENT_CONFIG[hitlPause.agentId === 'recommendation' ? 'framing' : hitlPause.agentId].icon, { size: 20 })}
                             </div>
                             <div>
                               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Paused Agent</p>
                               <p className="text-sm font-bold">{hitlPause.agentId === 'recommendation' ? 'Executive Synthesis' : AGENT_CONFIG[hitlPause.agentId].name}</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => setSelectedAgentId(hitlPause.agentId as AgentID)}
                              className="bg-zinc-900 text-white h-14 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg"
                            >
                              Open for Detailed Review
                            </button>
                            <button 
                              onClick={() => {
                                if (hitlPause.agentId === 'recommendation') {
                                    startRecommendation();
                                } else {
                                    resumeWorkflow();
                                }
                              }}
                              className="bg-zinc-100 text-zinc-900 h-14 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
                            >
                              <CheckCircle2 size={18} /> Proceed with Caveat
                            </button>
                          </div>
                          
                          <div className="mt-6 flex justify-center gap-8">
                            <button 
                              onClick={() => {
                                if (hitlPause.agentId !== 'recommendation') {
                                    handleRerunAgent(hitlPause.agentId as AgentID);
                                }
                              }}
                              className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest flex items-center gap-2"
                            >
                              <RefreshCw size={14} /> Rerun Agent
                            </button>
                            <button 
                              onClick={() => {
                                setHitlPause(null);
                                setCurrentScreen('input');
                              }}
                              className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-widest flex items-center gap-2"
                            >
                              <X size={14} /> Stop Workflow
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Detail Drawer Overlay */}
              <AnimatePresence>
                {selectedAgentId && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedAgentId(null)}
                      className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white shadow-2xl z-[70] overflow-y-auto"
                    >
                      {selectedAgent && (
                        <div className="p-10">
                          <header className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
                                {React.createElement(AGENT_CONFIG[selectedAgentId].icon, { size: 24 })}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{AGENT_CONFIG[selectedAgentId].name} Analysis</h3>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant={selectedAgent.status === 'accepted' ? 'success' : 'info'}>
                                    {selectedAgent.status.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant={selectedAgent.confidence}>
                                    {selectedAgent.confidence} Confidence
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => setSelectedAgentId(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                              <X size={20} />
                            </button>
                          </header>

                          <div className="space-y-10">
                            <section>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Strategic Summary</p>
                              <p className="text-lg font-medium leading-relaxed italic text-zinc-600">
                                "{selectedAgent.summary}"
                              </p>
                            </section>

                            <section>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Core Findings</p>
                              <ul className="space-y-3">
                                {(selectedAgent.details || []).map((d, i) => (
                                  <li key={i} className="text-sm flex gap-3 leading-relaxed">
                                    <span className="text-zinc-200 mt-1.5">•</span>
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </section>

                            <div className="grid grid-cols-2 gap-8">
                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Assumptions</p>
                                <ul className="space-y-2">
                                  {(selectedAgent.assumptions || []).map((a, i) => (
                                    <li key={i} className="text-[11px] text-zinc-500 italic bg-zinc-50 p-2 rounded border border-zinc-100">
                                      "{a}"
                                    </li>
                                  ))}
                                </ul>
                              </section>
                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Evidence Gaps</p>
                                <ul className="space-y-3">
                                  {(selectedAgent.evidence_gaps || []).map((g, i) => (
                                    <li key={i}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={g.impact}>{g.impact}</Badge>
                                        <p className="text-[11px] font-bold">{g.item}</p>
                                      </div>
                                      <p className="text-[10px] text-zinc-400 leading-relaxed ml-1">{g.why_it_matters}</p>
                                    </li>
                                  ))}
                                </ul>
                              </section>
                            </div>

                            <section className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                              <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ShieldAlert size={14} /> Primary Risk & Confidence
                              </p>
                              <p className="text-sm font-bold text-amber-900 mb-2">{selectedAgent.top_risk}</p>
                              <p className="text-xs text-amber-700/80 leading-relaxed">
                                {selectedAgent.confidence_rationale}
                              </p>
                            </section>

                            <section>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Analyst Notes (Human-in-the-loop)</p>
                              <textarea
                                value={selectedAgent.user_notes || ""}
                                onChange={(e) => updateAgentNotes(selectedAgentId, e.target.value)}
                                placeholder="Add observations, override assumptions, or provide missing data..."
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-300"
                              />
                            </section>

                            <div className="pt-10 border-t border-zinc-100 flex items-center justify-between">
                              <div className="flex flex-wrap gap-3">
                                {selectedAgent.status === 'accepted' || selectedAgent.status === 'completed' ? (
                                  <button
                                    onClick={() => updateAgentStatus(selectedAgentId, 'review_required')}
                                    className="bg-zinc-100 text-zinc-600 px-6 h-12 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                                  >
                                    Reopen for Review
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        updateAgentStatus(selectedAgentId, 'accepted');
                                        setSelectedAgentId(null);
                                        if (hitlPause?.agentId === selectedAgentId) {
                                          resumeWorkflow();
                                        }
                                      }}
                                      className="bg-zinc-900 text-white px-8 h-12 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200"
                                    >
                                      <CheckCircle2 size={16} /> Accept Analysis
                                    </button>
                                    <button
                                      onClick={() => skipWithCaveat(selectedAgentId)}
                                      className="bg-zinc-100 text-zinc-600 px-6 h-12 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                                    >
                                      Proceed with Caveat
                                    </button>
                                    <button
                                      onClick={() => handleRerunAgent(selectedAgentId)}
                                      className="bg-zinc-100 text-zinc-600 px-6 h-12 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                                    >
                                      <RefreshCw size={16} /> Rerun Agent
                                    </button>
                                  </>
                                )}
                              </div>
                              <button onClick={() => setSelectedAgentId(null)} className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest">
                                Close Review
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {/* SCREEN 3: EXECUTIVE RECOMMENDATION REVIEW */}
          {currentScreen === "recommendation" && recommendation && (
            <motion.section 
              key="recommendation"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto py-12 px-6"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setCurrentScreen("analysis");
                      setSelectedRecSection(null);
                    }}
                    className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="high">Executive Synthesis</Badge>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Final Decision Memo</p>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Strategic OS Bottom Line</h2>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {hasEdits && (
                    <div className="flex items-center gap-2 text-orange-600 animate-pulse bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                      <AlertTriangle size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Synthesis stale: Edits detected</span>
                    </div>
                  )}
                  <button
                    onClick={startRecommendation}
                    disabled={loadingRecommendation}
                    className="bg-zinc-900 text-white rounded-xl h-12 px-6 text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} className={loadingRecommendation ? 'animate-spin' : ''} />
                    Rerun Executive Synthesis
                  </button>
                </div>
              </div>

              {/* Recommendation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* 1. Recommended Decision */}
                <motion.div
                  onClick={() => setSelectedRecSection('executive_recommendation' as any)}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer rounded-2xl p-8 border border-zinc-200 bg-zinc-900 text-white hover:shadow-2xl transition-all shadow-xl group col-span-2"
                >
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex justify-between">
                    <span>Strategic Path Choice</span>
                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="info">{recommendation.executive_recommendation.recommendation_type}</Badge>
                    <Badge variant={recommendation.executive_recommendation.confidence}>{recommendation.executive_recommendation.confidence} confidence</Badge>
                  </div>
                  <h3 className="text-3xl font-black mb-6 leading-tight">
                    {recommendation.executive_recommendation.recommended_option}
                  </h3>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Impact Summary</p>
                      <p className="text-xs text-zinc-400 line-clamp-2">{recommendation.executive_recommendation.summary}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Primary Rationale</p>
                      <p className="text-xs text-zinc-400 line-clamp-2">{(recommendation.why_this_recommendation || [])[0]}</p>
                    </div>
                  </div>
                </motion.div>

                {/* 2. Decision Quality */}
                <motion.div
                  onClick={() => setSelectedRecSection('decision_quality_assessment' as any)}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer rounded-2xl p-8 border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-lg transition-all group"
                >
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-4 flex justify-between">
                    <span>Decision Quality</span>
                    <ChevronRight size={12} />
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Evidence</span>
                      <Badge variant={recommendation.decision_quality_assessment.evidence_quality === 'strong' ? 'success' : recommendation.decision_quality_assessment.evidence_quality === 'moderate' ? 'warning' : 'high'}>
                        {recommendation.decision_quality_assessment.evidence_quality}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Reversibility</span>
                      <Badge variant={recommendation.decision_quality_assessment.reversibility}>{recommendation.decision_quality_assessment.reversibility}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Risk Adj. ROI</span>
                      <Badge variant={recommendation.decision_quality_assessment.risk_adjusted_attractiveness}>{recommendation.decision_quality_assessment.risk_adjusted_attractiveness}</Badge>
                    </div>
                  </div>
                </motion.div>

                {/* 3. Trade-offs */}
                <motion.div
                  onClick={() => setSelectedRecSection('key_tradeoffs' as any)}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer rounded-2xl p-8 border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-lg transition-all group"
                >
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-4 flex justify-between">
                    <span>Strategic Trade-offs</span>
                    <ChevronRight size={12} />
                  </p>
                  <div className="space-y-4">
                    {(recommendation.key_tradeoffs || []).slice(0, 2).map((t, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1 h-8 bg-zinc-100 rounded" />
                        <div>
                          <p className="text-[10px] font-bold text-zinc-900 uppercase">{t.tradeoff}</p>
                          <p className="text-[10px] text-zinc-500 line-clamp-1">{t.implication}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* 4. Assumptions */}
                <motion.div
                  onClick={() => setSelectedRecSection('critical_assumptions' as any)}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer rounded-2xl p-8 border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-lg transition-all group"
                >
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-4 flex justify-between">
                    <span>Critical Assumptions</span>
                    <ChevronRight size={12} />
                  </p>
                  <div className="space-y-2">
                    {(recommendation.critical_assumptions || []).slice(0, 3).map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${a.status === 'accepted' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <p className="text-[11px] font-medium text-zinc-600 line-clamp-1 italic">"{a.assumption}"</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* 5. Risks */}
                <motion.div
                  onClick={() => setSelectedRecSection('risks_and_mitigations' as any)}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer rounded-2xl p-8 border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-lg transition-all group"
                >
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-4 flex justify-between">
                    <span>Risks & Mitigations</span>
                    <ChevronRight size={12} />
                  </p>
                  <div className="space-y-4">
                    {(recommendation.risks_and_mitigations || []).slice(0, 1).map((r, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={r.severity}>Severity: {r.severity}</Badge>
                          <p className="text-[11px] font-bold text-zinc-900 truncate">{r.risk}</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 italic">
                          Mitigation: {r.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* 6. Next 30 Days */}
                <motion.div
                  onClick={() => setSelectedRecSection('next_30_days' as any)}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer rounded-2xl p-8 border border-zinc-200 bg-emerald-50/30 hover:border-emerald-500 hover:shadow-lg transition-all group border-dashed"
                >
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-6 border-b border-emerald-100 pb-4 flex justify-between">
                    <span>Execution: Next 30 Days</span>
                    <ChevronRight size={12} />
                  </p>
                  <div className="space-y-4">
                    {(recommendation.next_30_days || []).slice(0, 2).map((s, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="text-[10px] font-black text-emerald-200">0{i+1}</div>
                        <div>
                          <p className="text-[11px] font-bold text-zinc-900 leading-tight">{s.action}</p>
                          <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">{s.owner}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* 7. Kill Criteria */}
                <motion.div
                  onClick={() => setSelectedRecSection('kill_or_reconsider_criteria' as any)}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer rounded-2xl p-8 border border-zinc-200 bg-red-50/30 hover:border-red-500 hover:shadow-lg transition-all group border-dashed"
                >
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-6 border-b border-red-100 pb-4 flex justify-between">
                    <span>Kill / Reconsider Criteria</span>
                    <ChevronRight size={12} />
                  </p>
                  <div className="space-y-4">
                    {(recommendation.kill_or_reconsider_criteria || []).slice(0, 1).map((k, i) => (
                      <div key={i}>
                        <p className="text-[11px] font-bold text-zinc-900 leading-relaxed mb-2">"{k.criterion}"</p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase">Threshold</p>
                            <p className="text-[10px] font-bold text-red-600">{k.threshold}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase">Review</p>
                            <p className="text-[10px] font-bold text-zinc-600">{k.review_timing}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Detail Drawer */}
              <AnimatePresence>
                {selectedRecSection && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedRecSection(null)}
                      className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-[70] overflow-y-auto"
                    >
                      <div className="p-12">
                        <header className="flex items-center justify-between mb-12">
                          <h3 className="text-2xl font-black uppercase tracking-tight">
                            {selectedRecSection.split('_').join(' ')}
                          </h3>
                          <button onClick={() => setSelectedRecSection(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                            <X size={20} />
                          </button>
                        </header>

                        <div className="space-y-12">
                          {selectedRecSection === 'executive_recommendation' && (
                            <>
                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Selected Strategic Choice</p>
                                <div className="p-6 bg-zinc-900 text-white rounded-2xl shadow-xl">
                                  <h4 className="text-2xl font-black mb-4">{recommendation.executive_recommendation.recommended_option}</h4>
                                  <div className="flex gap-2 mb-4">
                                    <Badge variant="info">{recommendation.executive_recommendation.recommendation_type}</Badge>
                                    <Badge variant={recommendation.executive_recommendation.confidence}>{recommendation.executive_recommendation.confidence} confidence</Badge>
                                  </div>
                                  <div className="space-y-3">
                                    {(recommendation.why_this_recommendation || []).map((l, i) => (
                                      <p key={i} className="text-sm text-zinc-400 leading-relaxed opacity-90">• {l}</p>
                                    ))}
                                  </div>
                                </div>
                              </section>

                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Executive Summary</p>
                                <p className="text-lg font-medium text-zinc-700 leading-relaxed">
                                  {recommendation.executive_recommendation.summary}
                                </p>
                              </section>

                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Rejected Alternatives</p>
                                <div className="space-y-4">
                                  {(recommendation.rejected_alternatives || []).map((alt, i) => (
                                    <div key={i} className="p-5 border border-zinc-100 rounded-xl bg-zinc-50">
                                      <p className="text-xs font-bold text-zinc-900 mb-2 uppercase">{alt.option}</p>
                                      <p className="text-xs text-zinc-500 leading-relaxed italic">Reason: {alt.why_not_selected}</p>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Boardroom Summary</p>
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl italic text-emerald-900 text-sm leading-relaxed">
                                  "{recommendation.final_boardroom_summary}"
                                </div>
                              </section>
                            </>
                          )}

                          {selectedRecSection === 'decision_quality_assessment' && (
                            <>
                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Decision Quality Assessment</p>
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Evidence Quality</p>
                                    <div className="text-2xl font-black text-zinc-900 mb-1 capitalize">{recommendation.decision_quality_assessment.evidence_quality}</div>
                                    <Badge variant={recommendation.decision_quality_assessment.evidence_quality === 'strong' ? 'success' : recommendation.decision_quality_assessment.evidence_quality === 'moderate' ? 'warning' : 'high'}>Quality</Badge>
                                  </div>
                                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Reversibility</p>
                                    <div className="text-2xl font-black text-zinc-900 mb-1 capitalize">{recommendation.decision_quality_assessment.reversibility}</div>
                                    <Badge variant={recommendation.decision_quality_assessment.reversibility}>Type {recommendation.decision_quality_assessment.reversibility === 'high' ? '2' : '1'}</Badge>
                                  </div>
                                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Risk Adj. ROI</p>
                                    <div className="text-2xl font-black text-zinc-900 mb-1 capitalize">{recommendation.decision_quality_assessment.risk_adjusted_attractiveness}</div>
                                    <Badge variant={recommendation.decision_quality_assessment.risk_adjusted_attractiveness}>Attractiveness</Badge>
                                  </div>
                                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Platform Leverage</p>
                                    <div className="text-2xl font-black text-zinc-900 mb-1 capitalize">{recommendation.decision_quality_assessment.platform_leverage}</div>
                                    <Badge variant={recommendation.decision_quality_assessment.platform_leverage}>Leverage</Badge>
                                  </div>
                                </div>
                              </section>

                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Evidence Gaps</p>
                                <ul className="space-y-3">
                                  {(recommendation.evidence_gaps || []).map((g, i) => (
                                    <li key={i} className="text-xs text-zinc-500 leading-relaxed flex gap-2">
                                      <span className="text-orange-500 font-bold">!</span> {g}
                                    </li>
                                  ))}
                                </ul>
                              </section>

                              <section>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">What Would Change the Decision?</p>
                                <div className="space-y-2">
                                  {(recommendation.what_would_change_the_decision || []).map((s, i) => (
                                    <div key={i} className="text-xs p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                      {s}
                                    </div>
                                  ))}
                                </div>
                              </section>
                            </>
                          )}

                          {selectedRecSection === 'key_tradeoffs' && (
                            <section>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Strategic Trade-off Matrix</p>
                              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                      <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400">Tradeoff</th>
                                      <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400">Implication</th>
                                      <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400">Stakeholder</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-50">
                                    {(recommendation.key_tradeoffs || []).map((row, i) => (
                                      <tr key={i} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-zinc-900">{row.tradeoff}</td>
                                        <td className="px-6 py-4 text-zinc-500 leading-relaxed">{row.implication}</td>
                                        <td className="px-6 py-4">
                                          <Badge variant="info">{row.stakeholder_most_affected}</Badge>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </section>
                          )}

                          {selectedRecSection === 'critical_assumptions' && (
                            <section>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Assumption Validation</p>
                              <div className="space-y-4">
                                {(recommendation.critical_assumptions || []).map((a, i) => (
                                  <div key={i} className="p-6 border border-zinc-100 rounded-2xl bg-zinc-50">
                                    <div className="flex justify-between items-start mb-4">
                                      <textarea 
                                        className="text-sm font-medium bg-transparent border-none focus:ring-0 w-full resize-none p-0 italic text-zinc-600"
                                        value={a.assumption}
                                        onChange={(e) => {
                                          const newAssumptions = [...recommendation.critical_assumptions];
                                          newAssumptions[i] = { ...a, assumption: e.target.value };
                                          updateRecommendation({ critical_assumptions: newAssumptions });
                                        }}
                                      />
                                    </div>
                                    <div className="mb-4">
                                      <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Validation Action Needed</p>
                                      <p className="text-xs text-zinc-500">{a.validation_action}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      {(['accepted', 'weak', 'needs_validation'] as const).map(status => (
                                        <button
                                          key={status}
                                          onClick={() => {
                                            const newAssumptions = [...recommendation.critical_assumptions];
                                            newAssumptions[i] = { ...a, status };
                                            updateRecommendation({ critical_assumptions: newAssumptions });
                                          }}
                                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                            a.status === status 
                                              ? 'bg-zinc-900 text-white border-zinc-900' 
                                              : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300'
                                          }`}
                                        >
                                          {status.replace('_', ' ')}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {selectedRecSection === 'risks_and_mitigations' && (
                            <section>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Risk Register (Active Management)</p>
                              <div className="space-y-6">
                                {(recommendation.risks_and_mitigations || []).map((risk, i) => (
                                  <div key={i} className="p-8 border border-zinc-100 rounded-3xl bg-zinc-50 relative overflow-hidden">
                                    <div className="flex flex-col gap-4">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-zinc-900">{risk.risk}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Severity</p>
                                          <div className="flex gap-2">
                                            <Badge variant={risk.severity}>{risk.severity}</Badge>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="bg-white p-4 rounded-xl border border-zinc-100">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase mb-2">Mitigation Strategy</p>
                                        <textarea 
                                          className="text-xs text-zinc-600 leading-relaxed italic bg-transparent border-none p-0 focus:ring-0 w-full resize-none"
                                          value={risk.mitigation}
                                          onChange={(e) => {
                                            const newRisks = [...recommendation.risks_and_mitigations];
                                            newRisks[i] = { ...risk, mitigation: e.target.value };
                                            updateRecommendation({ risks_and_mitigations: newRisks });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {selectedRecSection === 'next_30_days' && (
                            <section>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Action Plan: Next 30 Days</p>
                              <div className="space-y-4">
                                {(recommendation.next_30_days || []).map((step, i) => (
                                  <div key={i} className="p-6 border border-zinc-100 rounded-2xl bg-zinc-50 group">
                                    <div className="flex gap-6">
                                      <div className="text-2xl font-black text-zinc-200">0{i+1}</div>
                                      <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                          <textarea 
                                            className="text-sm font-bold text-zinc-900 bg-transparent border-none p-0 focus:ring-0 focus:border-none w-full resize-none"
                                            value={step.action}
                                            onChange={(e) => {
                                              const newSteps = [...recommendation.next_30_days];
                                              newSteps[i] = { ...step, action: e.target.value };
                                              updateRecommendation({ next_30_days: newSteps });
                                            }}
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                                          <div>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Ownership & Output</p>
                                            <p className="text-[11px] font-bold text-zinc-700 capitalize">{step.owner}</p>
                                            <p className="text-[10px] text-zinc-400 mt-1">{step.desired_output}</p>
                                          </div>
                                          <div>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Success Measure</p>
                                            <p className="text-[11px] text-zinc-500 italic">"{step.success_measure}"</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {selectedRecSection === 'kill_or_reconsider_criteria' && (
                            <section>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Kill / Invalidation Thresholds</p>
                              <div className="space-y-4">
                                {(recommendation.kill_or_reconsider_criteria || []).map((kill, i) => (
                                  <div key={i} className="p-8 border border-red-100 rounded-3xl bg-red-50/20">
                                    <div className="space-y-6">
                                      <div>
                                        <p className="text-[9px] font-bold text-red-400 uppercase mb-3">Criteria for Invalidation</p>
                                        <textarea 
                                          className="text-base font-black text-zinc-900 bg-transparent border-none p-0 focus:ring-0 w-full resize-none leading-tight"
                                          value={kill.criterion}
                                          onChange={(e) => {
                                            const newKill = [...recommendation.kill_or_reconsider_criteria];
                                            newKill[i] = { ...kill, criterion: e.target.value };
                                            updateRecommendation({ kill_or_reconsider_criteria: newKill });
                                          }}
                                        />
                                      </div>
                                      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-red-100">
                                        <div>
                                          <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Threshold</p>
                                          <input 
                                            className="text-xs font-bold text-red-600 bg-transparent border-none p-0 focus:ring-0 w-full"
                                            value={kill.threshold}
                                            onChange={(e) => {
                                              const newKill = [...recommendation.kill_or_reconsider_criteria];
                                              newKill[i] = { ...kill, threshold: e.target.value };
                                              updateRecommendation({ kill_or_reconsider_criteria: newKill });
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Timing</p>
                                          <p className="text-xs font-bold text-zinc-600">{kill.review_timing}</p>
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Decision Owner</p>
                                          <p className="text-xs font-bold text-zinc-600">{kill.decision_owner}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}
                        </div>

                        <div className="mt-16 pt-10 border-t border-zinc-100 flex items-center justify-between">
                          <button 
                            onClick={() => setSelectedRecSection(null)}
                            className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest"
                          >
                            Return to Bottom Line
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}

                {showEmailDrawer && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowEmailDrawer(false)}
                      className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-[70] overflow-y-auto"
                    >
                      <div className="p-12">
                        <header className="flex items-center justify-between mb-12">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
                              <Mail size={20} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Executive Memo Review</h3>
                          </div>
                          <button onClick={() => setShowEmailDrawer(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                            <X size={20} />
                          </button>
                        </header>

                        <div className="space-y-8">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Recipient (To)</p>
                              <input 
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                value={emailData.to}
                                onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">CC</p>
                              <input 
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                value={emailData.cc}
                                onChange={(e) => setEmailData({...emailData, cc: e.target.value})}
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Subject</p>
                              <input 
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                value={emailData.subject}
                                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Memo Content</p>
                              <div className="flex bg-zinc-100 p-1 rounded-lg">
                                <button 
                                  onClick={() => setMemoTab('preview')}
                                  className={`px-3 py-1 text-[9px] font-bold uppercase rounded ${memoTab === 'preview' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
                                >
                                  Preview
                                </button>
                                <button 
                                  onClick={() => setMemoTab('edit')}
                                  className={`px-3 py-1 text-[9px] font-bold uppercase rounded ${memoTab === 'edit' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
                                >
                                  Edit Raw
                                </button>
                              </div>
                            </div>

                            {memoTab === 'preview' && emailData.memo ? (
                              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 max-h-[600px] overflow-y-auto font-sans shadow-inner">
                                <div className="max-w-none space-y-8">
                                  <div className="border-b border-zinc-200 pb-4">
                                    <h4 className="text-xl font-black text-zinc-900 leading-tight">
                                      {emailData.subject}
                                    </h4>
                                  </div>

                                  <p className="text-sm text-zinc-600 leading-relaxed italic">
                                    {emailData.memo.opening}
                                  </p>

                                  <section>
                                    <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Executive Summary</h5>
                                    <p className="text-sm text-zinc-800 leading-relaxed font-medium">
                                      {emailData.memo.executive_summary}
                                    </p>
                                  </section>

                                  <section className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                                    <h5 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Recommendation</h5>
                                    <p className="text-base font-black text-emerald-900 leading-tight">
                                      {emailData.memo.recommendation}
                                    </p>
                                    <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase">Confidence: {emailData.memo.confidence}</p>
                                  </section>

                                  <div className="grid grid-cols-2 gap-8">
                                    <section>
                                      <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Key Trade-offs</h5>
                                      <ul className="space-y-2">
                                        {(emailData.memo.key_tradeoffs || []).map((t: string, i: number) => (
                                          <li key={i} className="text-[11px] text-zinc-600 flex gap-2">
                                            <span className="text-zinc-300">•</span> {t}
                                          </li>
                                        ))}
                                      </ul>
                                    </section>
                                    <section>
                                      <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Critical Assumptions</h5>
                                      <ul className="space-y-2">
                                        {(emailData.memo.critical_assumptions || []).map((a: string, i: number) => (
                                          <li key={i} className="text-[11px] text-zinc-600 flex gap-2">
                                            <span className="text-zinc-300">•</span> {a}
                                          </li>
                                        ))}
                                      </ul>
                                    </section>
                                  </div>

                                  <section>
                                    <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Risks & Mitigations</h5>
                                    <div className="space-y-2">
                                      {(emailData.memo.risks_and_mitigations || []).map((r: string, i: number) => (
                                        <div key={i} className="text-[11px] p-3 bg-red-50/50 border border-red-100 rounded-lg text-red-900">
                                          {r}
                                        </div>
                                      ))}
                                    </div>
                                  </section>

                                  <div className="grid grid-cols-2 gap-8">
                                    <section>
                                      <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Next 30 Days</h5>
                                      <ul className="space-y-2">
                                        {(emailData.memo.next_30_days || []).map((s: string, i: number) => (
                                          <li key={i} className="text-[11px] text-zinc-700 font-bold flex gap-2">
                                            <span className="text-zinc-300">0{i+1}</span> {s}
                                          </li>
                                        ))}
                                      </ul>
                                    </section>
                                    <section>
                                      <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Kill Criteria</h5>
                                      <ul className="space-y-2">
                                        {(emailData.memo.kill_or_reconsider_criteria || []).map((k: string, i: number) => (
                                          <li key={i} className="text-[11px] text-red-600 italic flex gap-2">
                                            <span className="text-red-200">!</span> {k}
                                          </li>
                                        ))}
                                      </ul>
                                    </section>
                                  </div>

                                  <p className="text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-6">
                                    {emailData.memo.closing}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <textarea 
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-xs leading-relaxed font-mono min-h-[500px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all shadow-inner"
                                value={emailData.body}
                                onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                                placeholder="Raw plain-text email memo content..."
                              />
                            )}
                          </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-zinc-100 flex items-center justify-between">
                          <div className="flex flex-col gap-6 w-full">
                            {sendResult && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${
                                  sendResult.success 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : 'bg-red-50 text-red-700 border border-red-100'
                                }`}
                                id="send-result-feedback"
                                role="status"
                              >
                                {sendResult.success ? (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>{sendResult.simulated ? 'SIMULATED: ' : ''}{sendResult.message || 'Memo dispatched successfully.'}</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle size={14} />
                                    <span>Error: {sendResult.message || 'Failed to dispatch memo.'}</span>
                                  </>
                                )}
                              </motion.div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex gap-4">
                                <button 
                                  onClick={handleSendEmail}
                                  disabled={sendingEmail || (sendResult?.success || false)}
                                  className={`h-12 px-8 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                                    sendingEmail 
                                      ? 'bg-zinc-100 text-zinc-400 cursor-wait' 
                                      : sendResult?.success 
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                  }`}
                                  id="send-memo-button"
                                >
                                  {sendingEmail ? (
                                    <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                                  ) : sendResult?.success ? (
                                    <Check size={14} />
                                  ) : (
                                    <Send size={14} />
                                  )}
                                  {sendingEmail ? 'Dispatching...' : sendResult?.success ? 'Dispatched' : 'Send Memo'}
                                </button>
                                <button 
                                  onClick={copyEmailToClipboard}
                                  className="h-12 px-8 border border-zinc-200 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2"
                                  id="copy-memo-button"
                                >
                                  <Copy size={14} /> Copy Body
                                </button>
                              </div>
                              <button 
                                onClick={() => setShowEmailDrawer(false)}
                                className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest"
                                id="cancel-memo-button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className="mt-20 pt-12 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <button 
                    onClick={prepareEmailMemo}
                    className="h-14 px-8 rounded-xl border border-zinc-200 text-sm font-bold hover:bg-zinc-50 transition-all flex items-center gap-2"
                  >
                    <FileText size={16} /> Prepare Email Memo
                  </button>
                  <button 
                    onClick={exportMarkdown}
                    className="h-14 px-8 rounded-xl border border-zinc-200 text-sm font-bold hover:bg-zinc-50 transition-all flex items-center gap-2"
                  >
                    <Maximize2 size={16} /> Export Markdown
                  </button>
                </div>
                
                <button 
                  onClick={handleClear}
                  className="h-14 px-10 bg-zinc-900 text-white rounded-xl text-sm font-black hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                >
                  Start New Decision Cycle
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Persistence Info */}
      <footer className="fixed bottom-0 left-0 right-0 h-4 bg-white border-t border-zinc-200 z-50 flex items-center px-6 justify-between text-[7px] font-bold text-zinc-300 uppercase tracking-widest">
        <div>Proprietary OS Framework 2026</div>
        <div className="flex gap-4">
          <span>Active Agents: Framing, Advisor</span>
          <span>Security: TLS 1.3 | AES-256</span>
        </div>
      </footer>
    </div>
  );
}
