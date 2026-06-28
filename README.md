# Harit Shukla — AI Product Lab

## Building Production-Grade AI Systems: Agents, Decision Intelligence & Automation

I'm a **Product Manager** exploring the intersection of **agentic AI workflows**, **structured decision-making**, and **real-world product implementation**. This portfolio showcases how I approach AI product problems: starting with clarity, designing for scale, and building with intentionality.

**For Hiring Managers**: These are personal projects that demonstrate my **methodology** (PRD → Architecture → Implementation), **documentation rigor**, and **thinking about compliance, scalability, and observability** from day one. [Let's discuss live](#-connect).

> **Focus**: Multi-agent orchestration • Decision automation • Compliance-aware AI design • PM-to-code translation

---

## 🚀 Featured Projects

### 1️⃣ 🤖 AI News Agent  
**Automated Intelligence Infrastructure for Curated Information Delivery**

🛠️ **Built with**: **IBM BOB** (Low-Code AI Development Platform)  
*Why?* Rapid prototyping of autonomous workflows with built-in deployment patterns, scheduling infrastructure, and modular component architecture. Demonstrates ability to leverage platform-specific tools for faster iteration and production-ready automation without reinventing infrastructure.

**The Problem**: How do you build a *reliable* automation system that runs autonomously on a laptop? How do you think about failure modes, logging, recovery, and scheduling at scale?

**The Approach**: 
- **Modular architecture** (7,000+ lines, ~20 cohesive components)
- **Comprehensive observability** from day one (logging at every layer, recovery mechanisms, error categorization)
- **Separation of concerns** (fetchers → filters → formatters → senders, each independently testable)
- **Production-ready mindset** without production infrastructure

**Key Artifacts**:
- 📋 [Implementation Plan](./AI-News-Agent/Documentation/PLAN.md) — System design & architecture
- 🏗️ [Modular Source Code](./AI-News-Agent/Code/src/) — 6 modular components with clear responsibilities
- ⚙️ [Setup & Deployment Guide](./AI-News-Agent/Documentation/SETUP_GUIDE.md) — Complete runbook
- 📝 [Technical Specifications](./AI-News-Agent/Documentation/TECHNICAL_SPEC.md) — Design decisions documented

**What This Demonstrates**:
- ✅ **Architecture thinking**: How to decompose a complex system into testable, reusable components
- ✅ **Observability**: Logging strategy, error handling, recovery paths for long-running jobs
- ✅ **Reliability**: 6-month track record, 0 missed deliveries (in personal use)
- ✅ **PM rigor**: System plan before code; documented design decisions

**Tech Stack**: 
- Python 3.9+ | IBM BOB | APScheduler + macOS LaunchAgent | RSS Feeds + ArXiv API | feedparser, BeautifulSoup4, Jinja2, Gmail SMTP

**Explore**:
- 💻 [Full Source Code & Documentation](./AI-News-Agent/Code/)
- 🎯 [Quick Start](./AI-News-Agent/Code/README.md)

**Note**: Personal project. [Chat 1-1](#-connect) to see it running live in my environment.

---

### 2️⃣ 📚 Strategic Decision OS  
**Multi-Agent AI System for Executive Decision-Making**

🛠️ **Built with**: **Google AI Studio** + **Gemini API**  
*Why?* Direct integration with frontier LLMs (Gemini 1.5 Flash for analysis, Pro for synthesis), streamlined multi-model orchestration, and hosted environment for immediate demo-ability. Demonstrates comfort working with latest AI capabilities and iterating on complex LLM workflows without heavy infrastructure overhead.

**The Problem**: How do you use AI for *structured reasoning* about ambiguous strategic decisions? How do you avoid hallucinations in regulated contexts? How do you design for human judgment, not replacement?

**The Approach**:
- **Sequential agent orchestration** (not parallel) so agents have full context
- **Human-In-The-Loop gates** triggered by low confidence, evidence gaps, or regulatory keywords
- **Structured outputs** with JSON validation to ensure consistency
- **Audit-first design** where every decision is traceable to inputs and assumptions

**Key Artifacts** (**PM Showcase**):
- 📋 [**Product Requirements Document (PRD)**](./Decision%20OS%20Agent/docs/PRD.md) — Full strategic context, functional + non-functional requirements
- 🏗️ [**Architecture Documentation**](./Decision%20OS%20Agent/docs/) — Multi-agent orchestration, HITL logic, decision flows
- 💻 [Source Code](./Decision%20OS%20Agent/src/) — TypeScript/React implementation with Gemini integration

**System Architecture** (Sequential State Machine):
1. **Decision Framing** — Reframe ambiguity into decision type (Reversible vs. Irreversible)
2. **Product & Market** — Customer pull vs. internal push; differentiation potential
3. **Platform Strategy** — Technical debt impact; build vs. buy vs. hybrid
4. **Financial Impact** — Opportunity cost, time-to-value, ROI confidence
5. **Risk & Governance** — Regulatory blockers, assumption validation, risk severity
6. **Executive Synthesis** — Final recommendation with tradeoff analysis

**What This Demonstrates**:
- ✅ **PM methodology**: PRD + Architecture + Implementation from day one
- ✅ **Multi-agent orchestration**: Sequential reasoning, HITL gates, structured contracts
- ✅ **Compliance thinking**: Designed for regulated (healthcare) context; audit trails built in
- ✅ **AI as decision workflow**: AI as tool for structured reasoning, not magic content generator
- ✅ **Cross-functional translation**: How to turn PM strategy into technical requirements

**Tech Stack**: 
- React + TypeScript | Google AI Studio | Gemini API (Flash + Pro) | Vite | Tailwind CSS | Sequential state machines

**Explore**:
- 📖 [Documentation & PRD](./Decision%20OS%20Agent/docs/)
- 💻 [Full Source Code](./Decision%20OS%20Agent/src/)

**Note**: Personal experimental project. [Chat 1-1](#-connect) to see it running live with example inputs.

---

## 🎓 What These Projects Demonstrate

### For Hiring Managers at AI/Tech Companies

| PM Methodology | Evidence | Project |
|---|---|---|
| **Clear Problem Definition** | Starts with "The Problem" + "Why It Matters" | Both |
| **Intentional Architecture** | Design before code; PRD + architecture docs | Decision OS (full PRD) |
| **Modular Thinking** | Decomposable components; testable pieces | AI News Agent (6 modules) |
| **Observability First** | Logging, error handling, recovery paths | AI News Agent (comprehensive logging strategy) |
| **Compliance Awareness** | HITL gates, audit trails, regulatory thinking | Decision OS (designed for healthcare compliance) |
| **Documentation Rigor** | Plans, specs, architecture docs, runbooks | Both (full artifact sets) |
| **Scalability Thinking** | How would this work at 10x, 100x scale? | Both (architecture designed to scale) |
| **Cross-functional Translation** | PM strategy → Technical requirements | Decision OS (PRD → Implementation) |
| **Platform Literacy** | Ability to evaluate and adopt new dev tools | Both (IBM BOB + Google AI Studio) |

### For Engineers

| Technical Signal | Detail | Project |
|---|---|---|
| **System Design** | Sequential orchestration, separation of concerns | Both |
| **Data Pipelines** | Fetch → Filter → Format → Send patterns | AI News Agent |
| **AI Integration** | Multi-model orchestration (Flash + Pro), token optimization | Decision OS |
| **Error Handling** | Comprehensive recovery, retry logic, graceful degradation | AI News Agent |
| **Code Quality** | Modular, testable, documented components | Both |

---

## 🛠️ My Approach to AI Product Building

**Three Core Principles**:

1. **Clarity Before Code**  
   Start with a clear problem statement, job-to-be-done, and architectural design. Both projects have detailed planning docs, PRDs, or architecture specs *before* implementation.

2. **Documentation Rigour**  
   Documentation isn't an afterthought. System plans, architectural decisions, deployment guides, and technical specs are foundational. Make your thinking visible.

3. **Production-Ready Mindset**  
   Logging, error handling, recovery mechanisms, and observability are built in from day one—not retrofitted. Think about failure modes first.

---

## 💡 Key Learnings Across Projects

**From AI News Agent**:
- Automation reliability requires comprehensive observability
- Modular architecture makes systems testable and maintainable
- Long-running jobs need recovery strategies and graceful degradation

**From Decision OS**:
- Structured reasoning requires sequential orchestration, not parallel agents
- Human judgment needs preserved (HITL gates, not full automation)
- Compliance constraints should shape architecture, not patch it later
- PRD + Architecture clarity prevents implementation rework

---

## 🛠️ Technology Stack (Portfolio Overview)

**Development Platforms**:
- **IBM BOB** — Low-code AI development, deployment patterns, autonomous workflow orchestration
- **Google AI Studio** — LLM-integrated application development, multi-model orchestration

**Languages & Frameworks**:
- Python 3.9+ (automation, data pipelines)
- TypeScript / React (frontend, AI integrations)
- HTML/CSS (UI, email templates)

**AI & ML**:
- Google Gemini API (multi-agent reasoning, multi-model orchestration)
- LLM orchestration (sequential agents, HITL logic, structured outputs)
- Content filtering & ranking algorithms

**Core Tools & Libraries**:
- APScheduler (job orchestration)
- Vite (build tools)
- Tailwind CSS (styling)
- feedparser, BeautifulSoup4 (data extraction)
- Gmail SMTP (email systems)

**Architecture Patterns**:
- Sequential agent orchestration
- Human-In-The-Loop (HITL) decision gates
- Structured JSON contracts & validation
- Content pipeline design (fetch → filter → format → send)
- Modular component architecture

---

## 📊 Project Metadata

| Metric | AI News Agent | Decision OS |
|---|---|---|
| **Status** | ✅ Experimental / Personal Use | ✅ Experimental / Demo Ready |
| **Platform** | IBM BOB | Google AI Studio |
| **Deployment** | Local (macOS LaunchAgent) | Local (AI Studio) |
| **Live Demo** | Available in 1-1 | Available in 1-1 |
| **Code Lines** | ~7,000 Python | ~3,500 TypeScript |
| **Documentation** | Implementation plan, specs, runbooks | PRD, architecture, decision docs |
| **Key Complexity** | Reliability at scale, observability | Agent orchestration, HITL design |
| **PM Signal** | Operations, automation thinking | Strategy, compliance, AI workflows |

---

## 🎯 How to Explore

### For Hiring Managers / Product Leaders (15 min)
**"Show me your PM methodology"**
1. Start with **Decision OS** [PRD](./Decision%20OS%20Agent/docs/PRD.md) (3 min)
2. Scan **AI News Agent** [Architecture/Plan](./AI-News-Agent/Documentation/PLAN.md) (3 min)
3. Review this README section: ["My Approach to AI Product Building"](#-my-approach-to-ai-product-building)
4. **[Chat 1-1](#-connect)** to discuss design thinking and trade-offs

### For AI/ML Engineers (20 min)
**"Show me the implementation"**
1. **Decision OS**: Review `src/services/geminiService.ts` for agent orchestration
2. **AI News Agent**: Browse `Code/src/` folder structure to see modular design
3. Explore setup guides and error handling strategies
4. **[Chat 1-1](#-connect)** for code walkthrough

### For Deep Technical Dive (45+ min)
1. Read both project READMEs end-to-end
2. Review full PRD and architecture docs (Decision OS)
3. Explore implementation details in source code
4. Compare design patterns and decisions across projects

### For Product Managers (30 min)
**"How would you approach this differently?"**
1. Read **Decision OS PRD** — This is how I think about strategy
2. Read **AI News Agent Plan** — This is how I break down complexity
3. Think about: Where would you make different trade-offs?
4. **[Chat 1-1](#-connect)** to discuss PM approach to AI systems

---

## 🔗 Connect

**For 1-1 Discussion on**:
- Live demo of either project
- Design decisions and trade-offs
- PM methodology for AI systems
- How I'd approach problems at your company

**Reach me**:
- **Email**: harryshukla613@gmail.com
- **GitHub**: [@haritshukla77](https://github.com/haritshukla77)
- **Interested in**: AI product strategy, multi-agent systems, decision intelligence, regulated AI

---

## 📄 License

Each project may have its own license. Refer to individual project directories for details.

---

**Last Updated**: June 2026  
**Built with** ❤️ **and AI**  
*Personal projects showcasing PM methodology and thinking*
