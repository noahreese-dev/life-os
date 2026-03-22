# Agent BTD -- Game Mechanics Design Document

> A complete mapping of Bloons Tower Defense mechanics to AI agent management. This document is the reference for every gameplay system in Agent BTD.

---

## 1. Tower Types (Agent Specializations)

Each tower type represents a category of AI agent with distinct capabilities, upgrade paths, and optimal placement strategies. Like BTD6, each tower has a base form and three divergent upgrade paths.

---

### 1.1 Dart Monkey --> The Coder

**BTD analog:** The Dart Monkey -- cheap, versatile, the bread and butter of any defense. First tower most players place.

**Agent BTD role:** A general-purpose coding agent. Handles file edits, bug fixes, feature implementation, refactoring. The most commonly deployed agent.

**Base stats:**
- Cost: Low (minimal configuration needed)
- Range: Medium (works on any standard coding task)
- Speed: Fast (quick iterations, small changes)
- Damage: Low-Medium (handles Red through Green balloons solo)

**Upgrade Path 1: Sharp Shooter (Precision)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Linting Eyes | +accuracy on small edits | Agent runs linter before submitting |
| 2 | Type Checker | Catches type errors before they ship | TypeScript strict mode, type-aware prompts |
| 3 | Surgical Strike | Can modify single lines with zero collateral | Precise context window, targeted edits only |
| 4 | Code Sniper | One-shot fixes for any isolated bug | Expert debugging prompt chain, root cause analysis |
| 5 | Master Coder | Rewrites entire modules cleanly | Full architectural context, can refactor at scale |

**Upgrade Path 2: Rapid Fire (Speed)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Quick Fingers | +speed on boilerplate tasks | Template-based generation, snippet libraries |
| 2 | Double Tap | Handles two files simultaneously | Multi-file edit capability |
| 3 | Sprint Mode | Processes task queues without pausing | Batch mode, no confirmation prompts |
| 4 | Machine Gun | Continuous output, handles balloon rushes | Streaming output, parallel sub-tasks |
| 5 | Turbo Coder | Processes entire features in one burst | Full feature scaffolding from spec to tests |

**Upgrade Path 3: Full Stack (Range)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Frontend Aware | Can handle CSS/HTML alongside JS | Multi-language context |
| 2 | Backend Reach | Handles API routes and database queries | Server-side tool access |
| 3 | Infra Vision | Sees deployment configs, CI/CD files | DevOps context files included |
| 4 | System Architect | Understands the full stack simultaneously | Complete codebase context map |
| 5 | Omni-Coder | No blind spots -- any file, any language, any layer | Universal agent with all tool permissions |

---

### 1.2 Sniper Monkey --> The Researcher

**BTD analog:** The Sniper Monkey -- long range, slow fire rate, high damage per shot. Picks off targets others can't reach.

**Agent BTD role:** A deep-research agent. Handles investigation, analysis, documentation review, competitive analysis, technical deep-dives. Slow but thorough.

**Base stats:**
- Cost: Medium
- Range: Infinite (can research anything accessible)
- Speed: Slow (thorough, not quick)
- Damage: High (resolves complex questions in one pass)

**Upgrade Path 1: Analyst (Depth)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Speed Reader | Processes docs faster | Optimized context parsing |
| 2 | Cross-Reference | Connects findings across sources | Multi-document synthesis |
| 3 | Deep Dive | Exhaustive research on single topics | Extended reasoning, chain-of-thought |
| 4 | Oracle | Predicts implications of findings | Trend analysis, consequence mapping |
| 5 | Omniscient | Near-perfect research with cited sources | Full web access + local knowledge + verification |

**Upgrade Path 2: Scout (Breadth)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Web Scanner | Basic web search capability | WebSearch tool access |
| 2 | Feed Monitor | Tracks multiple sources over time | RSS/API monitoring, scheduled checks |
| 3 | Trend Spotter | Identifies patterns across data points | Statistical analysis, pattern recognition |
| 4 | Intelligence Network | Monitors competitor/market activity | Multi-source aggregation, alerts |
| 5 | All-Seeing Eye | Real-time awareness of relevant developments | Continuous monitoring with smart filtering |

**Upgrade Path 3: Advisor (Output)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Summary Writer | Clean research summaries | Structured output templates |
| 2 | Brief Builder | Actionable briefing documents | Decision-ready formatting |
| 3 | Strategy Mapper | Recommends actions from research | Recommendation engine prompts |
| 4 | Decision Support | Provides options with trade-off analysis | Multi-criteria analysis frameworks |
| 5 | Chief Strategist | Autonomous strategic recommendations | Full context + business logic + judgment |

---

### 1.3 Ninja Monkey --> The Writer

**BTD analog:** The Ninja Monkey -- fast, stealthy, versatile. Can hit camo bloons that others miss.

**Agent BTD role:** A content and copy agent. Handles documentation, marketing copy, emails, proposals, blog posts, social media. Sees "invisible" tasks that technical agents miss (tone, branding, audience).

**Base stats:**
- Cost: Medium
- Range: Medium
- Speed: Fast
- Damage: Medium (but can hit Camo balloons -- tasks that require human-facing polish)

**Upgrade Path 1: Copywriter (Persuasion)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Hook Master | Strong opening lines | Headline/subject line optimization |
| 2 | Voice Match | Adapts to brand voice | Style guide adherence, tone calibration |
| 3 | Conversion Writer | Copy that drives action | CTA optimization, persuasive frameworks |
| 4 | Story Weaver | Narrative-driven content | Long-form storytelling, case studies |
| 5 | Silver Tongue | Any audience, any format, any goal | Universal persuasion across all mediums |

**Upgrade Path 2: Technical Writer (Clarity)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Doc Generator | Auto-generates documentation | JSDoc, README templates, API docs |
| 2 | Plain Language | Simplifies complex topics | Readability optimization |
| 3 | Knowledge Base | Maintains comprehensive docs | Wiki management, cross-linking |
| 4 | Tutorial Builder | Step-by-step guides from codebases | Tutorial generation from code analysis |
| 5 | Documentation Architect | Self-maintaining, always-current docs | Automated doc updates on code changes |

**Upgrade Path 3: Ghost Writer (Stealth)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Email Drafter | Professional email composition | Context-aware email templates |
| 2 | Proposal Writer | Client-facing proposals | Scope docs, SOWs, pitch decks |
| 3 | Thought Leader | Publishes content under CEO's voice | Blog posts, LinkedIn, thought pieces |
| 4 | Shadow Author | Manages entire content calendar | Multi-channel content scheduling |
| 5 | The Phantom | Indistinguishable from the CEO's own writing | Perfect voice cloning, autonomous publishing |

---

### 1.4 Engineer Monkey --> The Designer

**BTD analog:** The Engineer Monkey -- places sentries, builds things, creates structures that persist.

**Agent BTD role:** A UI/UX and visual design agent. Handles layouts, component design, CSS, animations, design systems. Creates structures that persist across the codebase.

**Base stats:**
- Cost: High
- Range: Short (needs specific design context)
- Speed: Medium
- Damage: Medium (but creates lasting structures)

**Upgrade Path 1: Pixel Pusher (Visual)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Color Theory | Consistent color palettes | Design token management |
| 2 | Layout Master | Responsive, clean layouts | Flexbox/Grid expertise, breakpoint logic |
| 3 | Animation Wizard | Smooth, purposeful animations | Framer Motion, CSS transitions, micro-interactions |
| 4 | Visual Storyteller | Designs that communicate narrative | Hero sections, scroll experiences, visual flow |
| 5 | Design Auteur | Signature visual style across all surfaces | Complete design system, brand-level consistency |

**Upgrade Path 2: System Builder (Architecture)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Component Maker | Reusable UI components | Atomic design, component library |
| 2 | Design Tokens | Centralized style management | CSS variables, theme system |
| 3 | Pattern Library | Documented component patterns | Storybook-equivalent documentation |
| 4 | Design System | Full self-documenting system | Comprehensive design system with rules |
| 5 | Auto-Designer | Generates new components from system rules | AI-generated components that match the system |

**Upgrade Path 3: UX Engineer (Experience)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Accessibility | WCAG-compliant outputs | A11y auditing, ARIA labels, semantic HTML |
| 2 | Performance | Optimized rendering | Lazy loading, code splitting, paint optimization |
| 3 | Interaction Design | Meaningful interactions | State management, user flow logic |
| 4 | User Psychology | Designs that understand behavior | Conversion optimization, friction reduction |
| 5 | Experience Architect | End-to-end user journeys | Full UX strategy, multi-touchpoint design |

---

### 1.5 Super Monkey --> The Tester

**BTD analog:** The Super Monkey -- expensive but devastating. Fires so fast it handles anything in range. The late-game powerhouse.

**Agent BTD role:** A QA and testing agent. Handles unit tests, integration tests, E2E tests, edge case discovery, regression testing. Expensive to set up but catches everything.

**Base stats:**
- Cost: Very High (significant setup investment)
- Range: Large (tests across entire codebase)
- Speed: Very Fast (runs many tests quickly)
- Damage: Very High (catches bugs before users do)

**Upgrade Path 1: Unit Fortress (Depth)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Test Writer | Generates unit tests for existing code | Jest/Vitest test generation |
| 2 | Edge Finder | Discovers edge cases automatically | Boundary analysis, null checks, overflow tests |
| 3 | Mutation Tester | Tests the tests -- finds weak coverage | Mutation testing frameworks |
| 4 | Property Tester | Generates thousands of randomized inputs | Property-based testing (fast-check style) |
| 5 | Formal Verifier | Mathematical proof of correctness | Type-level verification, invariant proofs |

**Upgrade Path 2: Integration Sweep (Breadth)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | API Tester | Tests endpoint contracts | REST/GraphQL contract testing |
| 2 | Flow Tester | Tests multi-step user workflows | E2E test generation (Playwright/Cypress) |
| 3 | Cross-Browser | Tests across environments | Multi-environment test matrix |
| 4 | Load Tester | Performance under stress | K6/Artillery load test generation |
| 5 | Chaos Monkey | Intentionally breaks things to find weaknesses | Chaos engineering, fault injection |

**Upgrade Path 3: Guardian (Prevention)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Pre-Commit Check | Catches issues before commit | Pre-commit hooks, linting gates |
| 2 | CI Watchdog | Monitors CI pipeline health | CI/CD integration, build failure analysis |
| 3 | Regression Shield | Prevents reintroduction of fixed bugs | Regression test suite management |
| 4 | Security Scanner | Finds vulnerabilities proactively | SAST/DAST scanning, dependency auditing |
| 5 | Immune System | Self-healing test infrastructure | Auto-updating tests, self-repairing CI |

---

### 1.6 Banana Farm --> The DevOps Agent

**BTD analog:** The Banana Farm -- doesn't attack at all. Instead, it generates income every round. The economic backbone.

**Agent BTD role:** An infrastructure and automation agent. Handles deployments, CI/CD, monitoring, server management, automation pipelines. Does not directly complete tasks -- instead, it generates ongoing value by keeping systems running and automating processes.

**Base stats:**
- Cost: High (upfront investment)
- Range: N/A (does not target balloons directly)
- Speed: N/A (passive income generation)
- Damage: None (but generates cash/resources every round)

**Upgrade Path 1: Plantation (Scale)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Auto-Deploy | Deploys on git push | Basic CI/CD pipeline (Vercel, Netlify) |
| 2 | Multi-Env | Staging + production environments | Environment management, preview deployments |
| 3 | Container Farm | Reproducible environments at scale | Docker, container orchestration |
| 4 | Server Fleet | Multiple services running simultaneously | Microservice management, load balancing |
| 5 | Cloud Empire | Full infrastructure-as-code | Terraform/Pulumi, multi-cloud management |

**Upgrade Path 2: Bank (Efficiency)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Cost Monitor | Tracks cloud spend | Budget alerts, usage dashboards |
| 2 | Auto-Scale | Scales resources with demand | Auto-scaling rules, right-sizing |
| 3 | Cache Layer | Reduces redundant compute | CDN, Redis, edge caching |
| 4 | Optimization Engine | Continuously reduces costs | AI-driven resource optimization |
| 5 | Perpetual Machine | Near-zero operational cost | Fully optimized, self-maintaining infrastructure |

**Upgrade Path 3: Marketplace (Monetization)**
| Tier | Name | Effect | Real Mapping |
|------|------|--------|-------------|
| 1 | Analytics | Basic usage tracking | Posthog, Plausible, basic metrics |
| 2 | Payment Rails | Accept payments | Stripe integration, billing system |
| 3 | Subscription Engine | Recurring revenue infrastructure | Subscription management, churn tracking |
| 4 | API Monetization | Sell access to your tools/data | API gateway, usage-based pricing |
| 5 | Revenue Machine | Fully automated income generation | Self-optimizing pricing, autonomous business ops |

---

## 2. Balloon Types (Task Difficulty Tiers)

Balloons in BTD have layers -- pop a Blue balloon and a Red comes out. This maps perfectly to tasks: complete a complex task and simpler sub-tasks are revealed inside.

### Tier Definitions

| Balloon | Color | BTD HP | Agent BTD: Task Type | Examples | Pops Into |
|---------|-------|--------|---------------------|----------|-----------|
| **Red** | Red | 1 | Trivial task | Fix a typo, update a version number, rename a variable | Nothing (done) |
| **Blue** | Blue | 2 | Simple task | Write a single component, fix a known bug, add a config option | 1 Red |
| **Green** | Green | 3 | Medium task | Implement a feature, set up a service, write a test suite | 1 Blue |
| **Yellow** | Yellow | 4 | Complex task | Design + implement a full page, integrate a third-party API | 1 Green |
| **Pink** | Pink | 5 | Multi-step task | Full user flow implementation, database migration + API + UI | 1 Yellow |
| **Black** | Black | 11 | Immune to certain agents | Tasks requiring specific expertise (e.g., only a Designer can handle this) | 2 Pinks |
| **White** | White | 11 | Immune to other agents | Tasks requiring different specific expertise | 2 Pinks |
| **Zebra** | Striped | 23 | Multi-discipline task | Needs BOTH specializations (design + code, research + writing) | 1 Black + 1 White |
| **Lead** | Gray | 23 | Shielded task | Requires human input/decision before agents can proceed | 2 Blacks |
| **Rainbow** | Multi | 47 | Major feature | Epic-level work -- multiple features, multiple agents needed | 2 Zebras |
| **Ceramic** | Brown | 104 | Sprint milestone | End-of-sprint deliverable, many sub-tasks | 2 Rainbows |
| **MOAB** | Blue blimp | 200 | Major milestone | Project phase completion, client deliverable, launch | 4 Ceramics |
| **BFB** | Red blimp | 700 | Project launch | Full project ship -- everything working, deployed, handed off | 4 MOABs |
| **ZOMG** | Green blimp | 4000 | Business milestone | Revenue target, funding round, major partnership | 4 BFBs |
| **DDT** | Dark camo blimp | 400 | Stealth crisis | Bug in production, client emergency, urgent unplanned work. Fast, hard to see coming, immune to many agents | -- |
| **BAD** | Purple blimp | 20000 | Existential crisis | Business-threatening event. Lose a major client, critical system failure, cash runs out | 3 ZOMGs + 2 DDTs |

### Layer Mechanic

When you complete a complex task, the sub-tasks inside are revealed. This is the "pop" mechanic:

- Finish a **MOAB** (major milestone) and 4 **Ceramic** tasks remain (sprint-level cleanup)
- Finish a **Rainbow** (major feature) and 2 **Zebra** tasks appear (cross-discipline polish)
- This cascading reveal models how real work behaves -- every big task decomposes into smaller ones

### Special Properties

| Property | BTD Meaning | Agent BTD Meaning |
|----------|------------|-------------------|
| **Camo** | Invisible to most towers | Task requires human-facing polish that technical agents miss (tone, branding, client relations) |
| **Regrow** | Regenerates layers over time | Recurring task that comes back if not properly automated (manual deploys, repeated bug patterns) |
| **Fortified** | Extra HP | Task with external dependencies that slow progress (waiting on client, blocked by third party) |

---

## 3. Heroes (The Human CEO)

In BTD6, you get one Hero per game. The Hero levels up automatically over rounds, has unique abilities, and is significantly more powerful than regular towers -- but there is only one.

In Agent BTD, the Hero is the human. You.

### Hero Stats

- **Placement:** You can only be "placed" on one project at a time (max 2 per day, per Life-OS rules)
- **Level:** Increases over time through experience (projects shipped, decisions made, skills learned)
- **Abilities:** Powerful but limited. Cooldown-based (you cannot make CEO-level decisions every minute)

### Hero Abilities

| Ability | Cooldown | Effect | Real Mapping |
|---------|----------|--------|-------------|
| **Strategic Decision** | 1/round | Resolve a Lead balloon (unblock an agent that needs human input) | Making the call -- pricing, scope, design direction, priority |
| **Client Meeting** | 2/round | Convert a balloon wave into cash (close a deal, collect payment) | The irreplaceable human relationship work |
| **Architect Mode** | 3/round | Redesign the map path (pivot a project's roadmap) | Major strategic pivot, scope change, direction shift |
| **Emergency Override** | 5/round | Instantly pop any single balloon regardless of type | Drop everything and personally handle a crisis |
| **Inspire** | 10/round | All towers gain +50% speed for the rest of the round | Deep focus session where you actively direct all agents simultaneously |

### Hero Leveling

| Level | Title | Unlock |
|-------|-------|--------|
| 1 | Operator | Can place and configure agents |
| 5 | Manager | Agents require less oversight (higher autonomy defaults) |
| 10 | Director | Unlock Farm Path 3 upgrades (monetization) |
| 15 | VP | Can run 2 maps simultaneously (manage 2 project contexts at once) |
| 20 | CEO | All agent upgrade costs reduced 20% (experience makes everything easier) |
| 25 | Founder | Unlock "Inspire" ability (deep focus multiplier) |
| 30 | Visionary | Map editor unlocked (design custom project templates) |
| 40 | Legend | All towers start at Tier 2 upgrades (your baseline is now expert) |

---

## 4. Maps (Project Roadmaps)

Each project is a map. The map's layout determines strategy -- where you can place towers, how long the path is, where the choke points are.

### Map Properties

| Property | BTD Meaning | Agent BTD Meaning |
|----------|------------|-------------------|
| **Path length** | How long balloons travel | Project timeline -- longer = more time to handle tasks |
| **Path complexity** | Curves, loops, intersections | Project complexity -- more curves = more strategic options |
| **Placement zones** | Where towers can go | Which project areas accept which agent types |
| **Water/land** | Different tower placement rules | Different environments (frontend vs. backend vs. infra) |
| **Choke points** | Narrow sections where towers are most effective | Critical project phases where agent placement matters most |
| **Line of sight** | Obstacles that block tower vision | Context boundaries (an agent assigned to frontend can't see backend issues) |

### Map Templates

**1. The Sprint (Beginner)**
- Shape: Simple S-curve
- Path length: Short (1-2 week timeline)
- Choke points: 1 (midpoint review)
- Best for: Single deliverables, client projects with clear scope
- Example: Hardware Ad+ video delivery

**2. The Marathon (Intermediate)**
- Shape: Long winding path with multiple curves
- Path length: Long (1-3 month timeline)
- Choke points: 3 (phase gates)
- Best for: Multi-phase projects, app development
- Example: UltrawashAPP -- Phase 1 UI, Phase 2 Backend, Phase 3 Integration

**3. The Loop (Advanced)**
- Shape: Circular path that balloons traverse multiple times
- Path length: Infinite (ongoing project)
- Choke points: 2 per loop (sprint start + sprint end)
- Best for: Iterative/agile projects, ongoing maintenance
- Example: IntelligenceMasters -- continuous improvement, no fixed end

**4. The Fork (Expert)**
- Shape: Path splits into 2-3 branches, then reconverges
- Path length: Medium, but parallel
- Choke points: At split and merge points
- Best for: Projects with parallel workstreams
- Example: Boz Agentic Personas -- hardware setup + app development + scope management

**5. The Meta-Map (Master)**
- Shape: Multiple maps visible simultaneously, connected by economic bridges
- Path length: Varies per sub-map
- Choke points: The bridges (resource allocation between projects)
- Best for: The CEO view -- all projects at once
- Example: Life-OS -- all 7+ projects rendered as interconnected maps, economy flowing between them

---

## 5. Rounds (Sprints / Phases)

### Round Structure

| Round Range | BTD Difficulty | Agent BTD Phase | Typical Content |
|-------------|---------------|----------------|-----------------|
| 1-10 | Early game | Project Setup | Red/Blue balloons. Setting up repos, configs, basic structure. Place your first towers. |
| 11-30 | Mid game | Core Development | Green through Rainbow balloons. Feature implementation, main deliverables. |
| 31-50 | Late game | Polish + Integration | Ceramic balloons and first MOABs. Integration testing, bug fixing, client review. |
| 51-70 | Very late | Launch Prep | BFBs appear. Deployment, documentation, handoff preparation. |
| 71-80 | Freeplay | Post-Launch | ZOMGs and DDTs. Production issues, feature requests, scope creep. |
| 80+ | Freeplay late | Maintenance | BAD balloons. Only fully upgraded agents and Hero abilities can handle these. |

### Between Rounds

After each round (sprint/phase), the game shows:

- **Round Summary:** Balloons popped (tasks completed), balloons leaked (tasks missed), cash earned
- **Economy Report:** Income this round, total cash, farm yields
- **Agent Performance:** Which towers popped the most, which were idle, which need upgrades
- **Next Wave Preview:** What's coming in the next round (upcoming tasks, their difficulty)
- **Upgrade Opportunity:** Spend accumulated cash on tower upgrades before the next wave

---

## 6. Lives (Deadline Tolerance)

You start each project with a number of lives based on the deadline structure:

| Deadline Type | Starting Lives | Meaning |
|---------------|---------------|---------|
| Hard deadline (client meeting, launch date) | 3 | Almost zero margin. Every leaked balloon matters. |
| Soft deadline (internal target) | 10 | Some flexibility, but lives drain = scope creep |
| No deadline (vision project) | 25 | Generous, but not infinite. Represents opportunity cost. |
| Ongoing (maintenance) | 50 | High tolerance, but lives still represent quality decay |

### Losing Lives

Each balloon that reaches the end of the path (task that misses its window) costs lives:

- Red/Blue/Green leak: -1 life
- Yellow/Pink leak: -2 lives
- Rainbow/Ceramic leak: -5 lives
- MOAB leak: -10 lives (this is a project-threatening miss)
- BFB leak: -25 lives (critical failure)
- BAD leak: Game over. Project is dead or relationship is broken.

### Life Regeneration

Lives can be recovered:

- **Hero ability: Client Meeting** -- Successful meeting restores 5 lives (renewed trust)
- **Shipping ahead of schedule** -- Bonus lives for early delivery
- **Farm income** -- Automated systems that prevent leaks passively restore 1 life/round

---

## 7. Cash / Economy

### Income Sources

| Source | BTD Equivalent | Yield | Real Mapping |
|--------|---------------|-------|-------------|
| **Popping balloons** | Pop income | $1-10 per pop based on balloon tier | Completing tasks generates small incremental value |
| **Round completion bonus** | Round bonus | $100 + round number | Sprint completion bonus -- finishing a phase unlocks next phase's budget |
| **Farms** | Banana Farm | $50-500/round based on upgrade | Automated systems generating ongoing value |
| **Eco sends** | BTD Battles eco | $1-5/round per eco unit | Taking on client work generates recurring relationship value |
| **Hero abilities** | Hero cash generation | Variable | CEO directly closing deals, negotiating rates |

### Spending

| Purchase | Cost Range | Real Mapping |
|----------|-----------|-------------|
| Place new tower | $200-2000 | Set up and configure a new agent |
| Tier 1-2 upgrades | $100-500 | Quick config improvements, better prompts |
| Tier 3 upgrades | $500-2000 | Significant capability additions (new tools, expanded context) |
| Tier 4 upgrades | $2000-10000 | Major agent overhaul (custom fine-tuning, specialized training) |
| Tier 5 upgrades | $10000-50000 | Pinnacle capability (fully autonomous, self-improving) |
| Farm placement | $1000-5000 | Automation investment (CI/CD setup, scheduled agents) |

### The Economy Meta-Game

The real game in Agent BTD -- just like in BTD -- is the economy. The question isn't "can I pop these balloons?" but "am I building economic infrastructure fast enough to handle the escalation?"

Key economic indicators visible on the HUD:

- **Cash on hand** -- Current available resources
- **Income per round** -- Total from all sources
- **Farm ratio** -- % of income from farms vs. active popping
- **Burn rate** -- Cash spent per round on tower upkeep and operations
- **Runway** -- Rounds until cash hits zero at current burn
- **Compound rate** -- How fast total capability is growing round-over-round

---

## 8. Powers and Abilities

### Tower Abilities (Activated Skills)

Each fully upgraded tower (Tier 5 in any path) gains an activated ability:

| Tower | Ability | Cooldown | Effect |
|-------|---------|----------|--------|
| Coder (Path 1 T5) | **Code Review** | 3 rounds | Audits all recent code changes across the project, catches hidden bugs |
| Coder (Path 2 T5) | **Speed Hack** | 5 rounds | Next 10 tasks completed at 3x speed |
| Coder (Path 3 T5) | **Polyglot** | 1 round | Can work in any language/framework for the rest of the round |
| Researcher (Path 1 T5) | **Deep Scan** | 5 rounds | Complete analysis of any topic with full source verification |
| Researcher (Path 2 T5) | **Surveillance** | 3 rounds | Monitors all relevant external changes for the rest of the round |
| Researcher (Path 3 T5) | **War Room** | 10 rounds | Generates complete strategic brief with options and recommendations |
| Writer (Path 1 T5) | **Campaign** | 5 rounds | Produces a full content suite (blog + social + email + landing page) |
| Writer (Path 2 T5) | **Living Docs** | 3 rounds | All project documentation auto-updates for the rest of the round |
| Writer (Path 3 T5) | **Ghostwrite** | 1 round | Produces content indistinguishable from CEO's voice |
| Designer (Path 1 T5) | **Redesign** | 10 rounds | Complete visual overhaul of any single page/component |
| Designer (Path 2 T5) | **System Sync** | 5 rounds | Enforces design system consistency across entire codebase |
| Designer (Path 3 T5) | **UX Audit** | 5 rounds | Full user experience analysis with prioritized fix list |
| Tester (Path 1 T5) | **Proof** | 10 rounds | Formal verification that a critical path has zero bugs |
| Tester (Path 2 T5) | **Chaos Round** | 5 rounds | Intentionally stress-tests everything, revealing hidden weaknesses |
| Tester (Path 3 T5) | **Shield** | 3 rounds | All code changes are auto-tested before merge for the rest of the round |
| DevOps (Path 1 T5) | **Scale Up** | 10 rounds | Infrastructure instantly handles 10x current load |
| DevOps (Path 2 T5) | **Optimize** | 5 rounds | Reduces all operational costs by 50% for 3 rounds |
| DevOps (Path 3 T5) | **Revenue Burst** | 10 rounds | All monetization systems optimized, 2x revenue for 3 rounds |

---

## 9. Co-Op Mode (Agent Swarms)

### How Co-Op Works in BTD

In BTD6 co-op, up to 4 players share a map. Each player has their own cash, places their own towers, but they share lives and face the same balloons. Communication and coordination determine success.

### Agent BTD Co-Op

Multiple agents working the same project simultaneously:

- **Shared map** -- All agents see the same project state
- **Individual cash** -- Each agent has its own context budget (token allocation)
- **Shared lives** -- All agents contribute to the same deadline
- **Coordination layer** -- Agents must not conflict (file locks, task claiming, merge conflict prevention)

### Swarm Configurations

| Config | Agents | Best For |
|--------|--------|----------|
| **Pair** | 2 agents (e.g., Coder + Tester) | Feature development with immediate QA |
| **Squad** | 3-4 agents (Coder + Designer + Tester + Writer) | Full feature delivery |
| **Army** | 5+ agents across specializations | Major milestone push, project sprint |
| **Hive** | Multiple agents of the same type | Parallel task processing (3 Coders on different features) |

### Coordination Mechanics

- **Task claiming:** When an agent starts a balloon, it's marked as "in progress" -- other agents won't target it
- **Handoff:** An agent can partially pop a balloon and pass the remainder to a specialist (Coder builds the feature, passes to Tester for verification)
- **Combo bonus:** When two different tower types target the same balloon within the same round, damage is multiplied 1.5x (cross-discipline collaboration bonus)
- **Conflict penalty:** When two agents edit the same file simultaneously, both take a speed penalty (merge conflict resolution time)

---

## 10. Progression System

### XP and Leveling

Every action earns XP:

| Action | XP |
|--------|-----|
| Pop a Red balloon | 1 |
| Pop a MOAB | 50 |
| Pop a BAD | 1000 |
| Complete a round with zero leaks | 25 |
| Place a new farm | 30 |
| Upgrade a tower to Tier 5 | 100 |
| Convert an eco process to a farm | 200 |

### Milestones

| XP Threshold | Milestone | Reward |
|-------------|-----------|--------|
| 100 | First Blood | Tutorial complete, all basic towers unlocked |
| 500 | Tower Defense | Tier 3 upgrades unlocked for all towers |
| 1000 | Economist | Farm Tier 3 unlocked, economy dashboard available |
| 2500 | Commander | Co-op mode unlocked, swarm configurations available |
| 5000 | Architect | Custom map templates, Tier 4 upgrades unlocked |
| 10000 | Grandmaster | Tier 5 upgrades unlocked, all abilities available |
| 25000 | Legend | Custom tower types, full game editor |
| 50000 | Transcendent | You've automated enough that the game plays itself. You won. |

### The Final Achievement

**"Technological Transcendence"** -- Earned when:
- All active projects have at least 3 farms running
- Farm income exceeds eco income for 10 consecutive rounds
- Zero lives lost in the last 5 rounds
- Hero has used "Inspire" ability at least once (you were deeply engaged, not just absent)

This means: Your agents handle the work. Your systems generate the value. You're present for the strategy. The digital life is handled. You're free.

---

*This document defines the game. Build from it. And remember: the real game is the economy. Always be farming.*
