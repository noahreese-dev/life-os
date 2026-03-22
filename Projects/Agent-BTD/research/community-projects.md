# Agent BTD -- Community and Ecosystem Research

> Last updated: Feb 24, 2026
> Research: GitHub API searches, project databases, training knowledge

---

## 1. Claude Code Gaming and RPG Ecosystem

### Claude Quest
- **Link**: https://github.com/Michaelliv/claude-quest (124 stars)
- RPG-style animation viewer for Claude Code. Reads JSONL logs, pixel-art.
- **Tech**: Go, Raylib
- Closest project to Agent BTD. Passive viewer only.
- Learn: JSONL log parsing is the technical bridge.

### Claude Code Game Master
- **Link**: https://github.com/Sstobo/Claude-Code-Game-Master (84 stars)
- RAG + RPG ruleset APIs for persistent text adventures.
- **Tech**: Python, RAG
- Learn: Cross-session game state via markdown.

### Claude Code Game Studios
- **Link**: https://github.com/Donchitos/Claude-Code-Game-Studios (5 stars)
- 48 AI agents, 36 skills, studio hierarchy.
- Exactly the Agent BTD mental model.

### Agent Office
- **Link**: https://github.com/pknull/ccworkspace (13 stars)
- Godot game visualizing AI agents in office. GDScript.

### Skills Weaver
- **Link**: https://github.com/nicmarti/skills-weaver (15 stars)
- RPG using Claude Code Agent SDK. Go.

### Unity MCP
- **Link**: https://github.com/IvanMurzak/Unity-MCP (1065 stars)
- AI-to-Unity bridge via MCP. C#.

### Other
- GameKit CLI: https://github.com/gamekit-agent/gamekit-cli (41 stars) TypeScript
- Pixel Plugin: https://github.com/willibrandon/pixel-plugin (50 stars)
- Plays Text Games: https://github.com/brendanlong/claude-code-plays-text-games (11 stars)

---

## 2. Claude Code Dashboards and Visualizers

### Essentials / Ralph TUI
- **Link**: https://github.com/GantisStorm/essentials-claude-code (81 stars)
- Workflow plugin with swarms, teams, TUI dashboard, Beads memory.
- The boring version of Agent BTD.

### tmuxcc
- **Link**: https://github.com/nyanko3141592/tmuxcc (50 stars)
- TUI for managing AI agents in tmux.

### HyperVault
- **Link**: https://github.com/Pardesco/hypervault (37 stars)
- 3D cyberpunk city for Obsidian. Projects = buildings. Three.js.
- CLOSEST AESTHETIC COUSIN to Agent BTD.

### clog
- **Link**: https://github.com/HillviewCap/clog (16 stars)
- Web viewer for Claude Code logs. HTML/JS single-file app.
- Key: JSONL parsing in browser.

---

## 3. Gamified Developer Productivity

### Habitica
- **Link**: https://github.com/HabitRPG/habitica (~12000 stars) | habitica.com
- Gold standard gamified productivity. RPG habit tracker.
- **Tech**: Node.js, Vue.js, MongoDB
- Learn: XP/gold/leveling, boss fights = deadlines.

### ENI Hooks
- **Link**: https://github.com/Goochbeater/ENI-Hooks-for-Claude-Code (12 stars)
- Game-like progression hooks for Claude Code. Python.

### RPG Task Manager
- **Link**: https://github.com/Azurekuz/RPG-Task-Manager (4 stars)
- Gamified task manager. Java.

---

## 4. Tower Defense in Programming/DevOps

Searches returned **ZERO results**. Agent BTD is genuinely novel.

- philipp-meier/TowerDefense: https://github.com/philipp-meier/TowerDefense (TypeScript/Canvas ref)

---

## 5. Programming-as-Game Ecosystem

- **Screeps** (screeps.com, ~6500 stars): MMO RTS via JavaScript. Most relevant ancestor.
- **Bitburner** (github.com/bitburner-game/bitburner-src, ~4600 stars): Cyberpunk incremental. TS/React.
- **Factorio** (factorio.com): Factory automation. Core loop = Agent BTD loop.
- **Shenzhen I/O**: Constraint puzzles, minimalist UI.
- **TIS-100**: Node communication visualization.
- **SpaceChem**: Visual pipeline programming.

---

## 6. Gamified Productivity

- **Forest App** (forestapp.cc): Visual growth + focus timer.
- **GitHub Contribution Graphs**: Streak visualization.
- **Todoist Karma**: Points, levels, streaks.
- **CodeCombat** (codecombat.com): Code controls game characters.

---

## 7. AI Agent Management

- **AgentOps** (github.com/AgentOps-AI/agentops, ~3000 stars): Datadog for AI agents.
- **CrewAI** (github.com/crewAIInc/crewAI, ~25000 stars): Agent roles = tower types.
- **LangGraph** (github.com/langchain-ai/langgraph, ~10000 stars): Visual graph builder. Node placement = tower placement.

---

## 8. Key Takeaways

### Confirmed Novel
1. Tower defense + task management: **Zero results**
2. Tower defense + AI agent orchestration: **Zero results**
3. BTD Battles eco + productive work: **Unexplored**

### Architecture Patterns
1. JSONL log parsing (Claude Quest, clog)
2. Persistent game state in markdown (Game Master)
3. Hook-based events (ENI Hooks)
4. Three.js for 3D (HyperVault)
5. HTML5 Canvas for 2D TD

### Build Influences
| Component | Primary | Secondary |
|-----------|---------|----------|
| Log parsing | clog, Claude Quest | AgentOps |
| Rendering 2D | HTML5 Canvas TD | Bitburner |
| Rendering 3D | HyperVault Three.js | Unity MCP |
| Agent roles | CrewAI, Game Studios | LangGraph |
| Economy | BTD Battles, Habitica | Factorio |
| Persistence | Game Master md | Beads |
| Events | ENI Hooks | CC hooks |
| Pixel art | Pixel Plugin | Claude Quest |

### MVP Path
1. Parse Claude Code JSONL logs (proven)
2. Render as HTML5 Canvas (proven)
3. Map tool calls to balloon pops (novel)
4. Map Claude instances to tower positions (novel)
5. Add eco counter from STATUS.md (novel)
6. Generate as static HTML like /calendar

### Searches Run
| Query | Results | Finds |
|-------|---------|-------|
| claude code game | 436 | Claude Quest, Game Master, Studios |
| claude code TUI dashboard | 33 | Ralph TUI, tmuxcc |
| ai agent visualization | 112 | HyperVault |
| tower defense productivity | 0 | Confirms novelty |
| tower defense devops | 0 | Confirms novelty |
| claude code monitor | 5 | clog |
