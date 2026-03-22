# Agent BTD -- Roadmap

> Five phases from static visualization to shareable product.

---

## Phase 1: The Map (Static HTML Dashboard)

**Concept:** A single HTML file -- like the `/calendar` output -- that renders your projects, tasks, and agents as a BTD-style map. Read from markdown files in Life-OS. No server. No framework. Just open the file and see the battlefield.

### Deliverables

1. **Map renderer** -- An HTML/CSS/JS file that draws a BTD-style map:
   - A winding path representing the project timeline (left = past, right = future)
   - Balloons on the path representing tasks, color-coded by difficulty tier
   - Monkey tower icons placed alongside the path representing agents
   - A sidebar showing cash (budget), lives (deadline tolerance), and round (current sprint)

2. **Markdown parser** -- A JS module that reads Life-OS markdown files and extracts:
   - Projects from `STATUS.md` (each project = a map or a lane on the map)
   - Tasks from project assessment files and weekly logs
   - Agent configurations from a new `agents.md` file (name, type, upgrade level)

3. **Map templates** -- At least 3 map layouts:
   - **Linear** -- Simple left-to-right path (good for single projects with clear timelines)
   - **Loop** -- Path that curves back, representing iterative/agile workflows
   - **Multi-lane** -- Multiple parallel paths for multi-project view (the "meta map")

4. **Visual assets** -- CSS/SVG representations of:
   - 6 balloon types (Red through MOAB) -- see GAME-MECHANICS.md for tier definitions
   - 6 tower types (Coder, Researcher, Writer, Designer, Tester, DevOps)
   - Basic upgrade indicators (border glow, size increase, color shifts)
   - Economy panel (cash display, income/round, farm count)

5. **Generator script** -- A Node.js or Python script (or Claude Code skill) that:
   - Reads the markdown source files
   - Applies the map template
   - Outputs `agent-btd.html` that can be opened in any browser
   - Optionally auto-opens in browser on generation

### Scope Estimate
- **Core rendering:** 2-3 focused sessions
- **Markdown parsing:** 1-2 sessions
- **Visual polish:** 1-2 sessions
- **Total:** ~5-7 sessions (a "session" = one deep work block, ~2-4 hours)

### Dependencies
- Life-OS markdown files must follow a consistent structure (STATUS.md, ASSESSMENT.md files)
- Need to define the `agents.md` schema (what fields describe an agent)
- SVG/CSS art direction decision: pixel art? geometric/minimal? BTD6-faithful?

### Success Criteria
- Open `agent-btd.html` and instantly understand: what projects exist, what tasks are in flight, what agents are deployed, and what the resource situation is.
- It should take less than 3 seconds to read the battlefield.
- Someone who has played BTD should immediately grok the interface without explanation.

---

## Phase 2: The Live Game (Real-Time Monitoring)

**Concept:** Connect to Claude Code's JSONL session logs and render agents working in real-time. Balloons move along the path as tasks progress. Towers animate when agents are active. The map is alive.

### Deliverables

1. **JSONL log watcher** -- A file watcher (Node.js or Python) that:
   - Monitors Claude Code session log directories (`~/.claude/projects/*/sessions/`)
   - Parses JSONL entries for agent activity (tool calls, file edits, messages)
   - Emits events: `agent_active`, `task_started`, `task_completed`, `error`, `idle`

2. **WebSocket bridge** -- A lightweight local server that:
   - Receives events from the log watcher
   - Pushes them to the browser via WebSocket
   - Handles multiple simultaneous agent sessions

3. **Live map renderer** -- Enhanced HTML dashboard that:
   - Animates balloons moving along the path (task progress)
   - Shows tower "firing" animations when agents complete actions
   - Displays a real-time activity feed (what each agent is doing right now)
   - Updates economy panel as tasks complete (cash earned per pop)
   - Shows "round progress" -- how far through the current sprint/phase

4. **Agent status indicators:**
   - Idle (gray, no animation)
   - Working (glowing, projectile animations)
   - Blocked (red pulse, warning icon)
   - Completed (green flash, +cash popup)

5. **Balloon lifecycle animations:**
   - Spawn at path entrance (task created)
   - Move along path (task in progress)
   - Pop with particle effect (task completed)
   - Layer-peel when partially completed (sub-tasks revealed)
   - Leak off screen edge (task missed/deadline passed) -- costs a life

### Scope Estimate
- **JSONL parser + log watcher:** 2-3 sessions
- **WebSocket server:** 1 session
- **Live rendering + animations:** 3-4 sessions
- **Integration + testing:** 2 sessions
- **Total:** ~8-10 sessions

### Dependencies
- Phase 1 complete (static map works)
- Understanding of Claude Code JSONL log format and directory structure
- Decision on animation library: vanilla CSS animations vs. a lightweight library (GSAP, anime.js, or Canvas/WebGL)

### Success Criteria
- Watch an agent session in Claude Code and simultaneously see the BTD map animate in real-time.
- When an agent completes a task, you see the balloon pop and the cash increment.
- When an agent is blocked, the tower flashes red before you even read the error in terminal.
- Latency between agent action and visual update: under 500ms.

---

## Phase 3: The Strategy Layer (Interactive Management)

**Concept:** Stop just watching -- start playing. Place agents on the map, assign them to tasks, upgrade their capabilities, and manage your operation through the game interface instead of the terminal.

### Deliverables

1. **Tower placement UI:**
   - Drag-and-drop agents from a sidebar onto map positions
   - Each position maps to a project area or task category
   - Placement triggers agent configuration (what context files it reads, what tools it has access to)
   - Sell/remove towers to reallocate agents

2. **Upgrade interface:**
   - Click a tower to see its 3 upgrade paths (see GAME-MECHANICS.md)
   - Each upgrade corresponds to a real capability improvement:
     - Better prompts/context
     - Access to more tools
     - Higher autonomy level
   - Upgrades cost resources (time to configure, compute credits)

3. **Task queue management:**
   - View upcoming balloon waves (task backlog)
   - Reorder, reprioritize, or split tasks
   - Mark tasks as different balloon types (reassess difficulty)
   - Create new balloons (add tasks) directly from the interface

4. **Agent dispatch:**
   - Click a tower, click "activate" -- starts a Claude Code session with that agent's configuration
   - Pre-built agent configs stored as templates (CLAUDE.md snippets, tool permissions, context files)
   - Session parameters set through the game UI, not through CLI flags

5. **Round control:**
   - Start/pause rounds (begin/pause a sprint)
   - Fast-forward (batch process)
   - "Send next wave" button (pull in the next set of tasks)
   - Round summary screen between waves (sprint retrospective view)

### Scope Estimate
- **Placement + drag-and-drop:** 2-3 sessions
- **Upgrade system:** 3-4 sessions
- **Task queue UI:** 2-3 sessions
- **Agent dispatch integration:** 3-4 sessions (hardest part -- bridging UI to CLI)
- **Round control:** 2 sessions
- **Total:** ~12-16 sessions

### Dependencies
- Phase 2 complete (real-time monitoring works)
- Agent configuration schema finalized
- Claude Code CLI API or scripting interface for programmatic session launch
- Decision: web app framework? (Likely move from static HTML to Astro/React at this point)

### Success Criteria
- Manage an entire sprint without opening the terminal directly.
- Place an agent, assign it tasks, watch it work, upgrade it when needed -- all through the BTD interface.
- The experience of managing work feels like playing a strategy game, not doing project management.

---

## Phase 4: The Economy (Resource Compounding System)

**Concept:** Track the real economics of your operation -- budget, time, energy, compute costs, revenue -- through BTD's economy system. Farms generate passive income. Eco tracks active hustle. The compounding curve is visible and gamified.

### Deliverables

1. **Resource tracking engine:**
   - **Cash** = Actual money (invoiced, received, projected)
   - **Bananas** = Compute/API credits (tokens used, cost per task)
   - **Lives** = Deadline buffer (days remaining before hard deadlines)
   - **XP** = Cumulative experience (tasks completed, complexity handled)

2. **Farm system:**
   - Register automated processes as "farms" (CI/CD pipelines, scheduled agents, auto-deployers)
   - Each farm has a "yield per round" -- measurable output it produces without intervention
   - Track ROI: how much did the farm cost to set up vs. how much has it produced?
   - Farm upgrade paths (optimize, scale, replicate)

3. **Eco tracker:**
   - Track active income sources (client projects, contracts)
   - Eco rate = income per sprint from active work
   - Visualize the eco-to-farm conversion: how much active work is becoming automated?
   - "Eco sends" = new projects taken on, tracked as offensive plays

4. **Compounding dashboard:**
   - Graph: Total capability over time (agents deployed x upgrade levels x farms running)
   - Graph: Passive vs. active income ratio
   - Graph: Time spent managing vs. time agents work autonomously
   - Milestone markers: "First farm placed," "Eco exceeded defense," "100 balloons popped"

5. **Financial integration:**
   - Pull from `ACCOUNTING.md` and `STATUS.md` revenue data
   - Track: receivables, burn rate, runway
   - Project: at current farm growth rate, when does passive output exceed active input?
   - Alert: "You're spending more on defense than eco -- your economy is stalling"

### Scope Estimate
- **Resource tracking engine:** 3-4 sessions
- **Farm registration + yield tracking:** 2-3 sessions
- **Eco tracker:** 2 sessions
- **Compounding dashboard:** 3-4 sessions
- **Financial integration:** 2-3 sessions
- **Total:** ~12-16 sessions

### Dependencies
- Phase 3 complete (interactive management works)
- ACCOUNTING.md or equivalent financial data source
- Definition of "farm" registry format (what data describes an automated process)
- Historical data for compounding graphs (or start tracking from Phase 4 launch)

### Success Criteria
- Open the economy panel and immediately know: Am I getting richer or poorer? Is my operation compounding or stalling?
- The farm count is a number you want to grow. Every new automation feels like placing a Banana Farm.
- The eco-to-farm ratio tells you whether you're building an empire or running a treadmill.

---

## Phase 5: The Arena (Multiplayer / Shareable Product)

**Concept:** Package Agent BTD as something others can use. A Claude Code skill. A standalone tool. Maybe a product. The BTD interface for AI agent management becomes a thing people share, customize, and build on.

### Deliverables

1. **Claude Code skill package:**
   - `/btd` -- Renders current session as a BTD map
   - `/btd status` -- Quick text summary in BTD language ("3 towers active, 12 balloons in flight, 2 farms yielding, $4,200 cash")
   - `/btd place <agent-type> <project>` -- Deploy an agent
   - `/btd upgrade <agent> <path>` -- Upgrade an agent
   - `/btd eco` -- Show economy dashboard
   - Skill installs with a single command, reads existing project structure

2. **Configuration system:**
   - `btd.config.md` or `btd.config.json` -- Define your maps, towers, balloon types
   - Custom tower types for different workflows (not just coding -- marketing, sales, ops)
   - Custom balloon types for different task taxonomies
   - Theme support (BTD6 faithful, cyberpunk, minimal, custom)

3. **Sharing + templates:**
   - Export your map configuration as a shareable file
   - Import someone else's tower configurations
   - "Map packs" -- pre-built configurations for common workflows:
     - Solo SaaS builder
     - Agency with multiple clients
     - Open source maintainer
     - Content creator

4. **Leaderboard / achievements (opt-in):**
   - Track personal stats: rounds survived, balloons popped, farms built
   - Achievements: "First MOAB popped," "10 farms running," "Zero lives lost in a sprint"
   - Optional sharing: post your map screenshots, compare strategies

5. **API / extension points:**
   - Webhook support for custom integrations
   - Plugin system for custom tower types (bring your own agent framework)
   - Data export (JSON, CSV) for external analysis
   - Embeddable widgets (show your BTD status on a website or dashboard)

### Scope Estimate
- **Skill package:** 4-5 sessions
- **Configuration system:** 3-4 sessions
- **Sharing + templates:** 3-4 sessions
- **Achievements:** 2-3 sessions
- **API + extensions:** 4-5 sessions
- **Total:** ~16-21 sessions

### Dependencies
- Phase 4 complete (full economy system works)
- Claude Code skill API documentation and packaging requirements
- Decision: open source? commercial? hybrid?
- Community feedback from early alpha users

### Success Criteria
- Someone who has never seen Agent BTD can install the skill, run `/btd`, and see their projects as a BTD map within 5 minutes.
- The configuration system is flexible enough that it works for workflows you haven't imagined.
- At least one person other than Noah says: "This changed how I think about managing my agents."

---

## Phase Summary

| Phase | Name | Core Deliverable | Sessions | Cumulative |
|-------|------|-----------------|----------|------------|
| 1 | The Map | Static HTML dashboard | 5-7 | 5-7 |
| 2 | The Live Game | Real-time monitoring | 8-10 | 13-17 |
| 3 | The Strategy Layer | Interactive management | 12-16 | 25-33 |
| 4 | The Economy | Resource compounding | 12-16 | 37-49 |
| 5 | The Arena | Shareable product | 16-21 | 53-70 |

**Total estimated scope: 53-70 deep work sessions.**

At 2-3 sessions per week (alongside other projects), that is roughly 6-9 months to full product. But Phase 1 ships value in one week. Phase 2 ships value in three weeks. You do not wait for Phase 5 to start playing the game.

---

## Build Philosophy

- **Each phase is independently useful.** Phase 1 alone is a better project dashboard than most tools. Phase 2 alone is a monitoring system. You can stop at any phase and have a complete thing.
- **Ship the simplest version of each phase first.** Phase 1 does not need beautiful SVG art. It needs colored circles on a line with labels. Polish comes after function.
- **Use the tool to build the tool.** Agent BTD should manage its own development. The first balloon on the first map should be "Build Phase 1 of Agent BTD."
- **Dogfood relentlessly.** If you're not opening the BTD dashboard every day by Phase 2, something is wrong with the design.

---

*The roadmap is the path. The balloons are already coming. Start placing towers.*
