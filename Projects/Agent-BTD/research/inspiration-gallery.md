# Agent BTD -- Inspiration Gallery

> Visual references, demos, and screenshots for Agent BTD design
> Last updated: Feb 24, 2026

---

## Tier 1: Most Directly Relevant

### Claude Quest -- Pixel Art Agent Viewer
- **Link**: https://github.com/Michaelliv/claude-quest
- Pixel-art RPG character reacting to Claude Code tool calls in real-time
- See repo README for GIF demos of Raylib-rendered viewer
- Proves pixel art + Claude Code session data = engaging visual
- Tower idle/fire/upgrade animations map from character animations

### HyperVault -- 3D Cyberpunk Project City
- **Link**: https://github.com/Pardesco/hypervault
- Three.js rendered cyberpunk city inside Obsidian. Projects are buildings.
- Closest thing to game world as project dashboard
- Premium dark mode, neon highlights, 3D buildings = real projects
- Key: glowing buildings, dark bg, floating labels, agent status indicators

### Bloons TD 6 -- The Source Material
- **Link**: https://store.steampowered.com/app/960090/Bloons_TD_6/
- Colorful 2.5D maps, monkey towers, balloon waves, MOAB-class bloons
- YouTube: search BTD6 gameplay for visual reference
- Every element maps: tower=agent, balloon=task, path=roadmap, upgrade menu=config
- Key: placement circles, range indicators, upgrade tree UI, wave counter, speed controls

### BTD Battles 2 -- The Economy Model
- **Link**: https://store.steampowered.com/app/1276390/Bloons_TD_Battles_2/
- Split-screen PvP with eco bar, send balloon buttons, farm placement
- YouTube: BTD Battles 2 eco strategy
- The eco bar growing over time is THE key visual Agent BTD needs

---

## Tier 2: Strong Aesthetic/Mechanic Inspiration

### Factorio -- The Automation Aesthetic
- **Link**: https://factorio.com
- Top-down factory view with conveyor belts, assemblers, pollution
- Watching items flow along belts = tasks through agent pipelines
- Key: conveyor belts (pipelines), machines (agents), minimap

### Bitburner -- Cyberpunk Coding Game UI
- **Link**: https://github.com/bitburner-game/bitburner-src
- **Play free**: https://bitburner-official.github.io
- Terminal-like interface with cyberpunk theming, server maps, money counters
- React-based game UI. Dark mode, green text, neon accents.
- Server network graph = agent-to-project connections

### Screeps -- Programming RTS Visualization
- **Link**: https://screeps.com
- **Live viewer**: https://screeps.com/a/#!/map
- Top-down tile map with animated creeps, resource nodes, territory borders
- Real-time visualization of programmed agents working autonomously

### Habitica -- Gamified Productivity UI
- **Link**: https://habitica.com (free)
- Pixel-art RPG: avatar, health/XP/gold bars, quest boards, boss fights
- Most polished gamified productivity UI in existence
- Key: avatar+equipment, XP bar, gold counter, streak fire, boss HP bar

---

## Tier 3: Specific Visual Elements

### Essentials Ralph TUI
- https://github.com/GantisStorm/essentials-claude-code
- Terminal dashboard with agent status panels, progress bars
- Agent BTD should match info density but with game graphics

### tmuxcc
- https://github.com/nyanko3141592/tmuxcc
- Multiple agents visible simultaneously in split panes
- Map view needs to show all active agents at once

### LangGraph Studio
- https://github.com/langchain-ai/langgraph
- Drag-and-drop graph with execution flow highlighting
- Dragging agents onto map = dragging nodes onto graph

### AgentOps Dashboard
- https://github.com/AgentOps-AI/agentops
- Session timelines, cost charts, tool call breakdowns
- Same metrics displayed as tower stats instead of charts

---

## Tier 4: Broader Aesthetic

### Shenzhen I/O -- Technical Datasheet Aesthetic
- https://store.steampowered.com/app/504210/SHENZHEN_IO/
- Fake datasheets, circuit boards, CRT monitor feel
- Agent BTD could have datasheet view per tower/agent

### TIS-100 -- Node Communication
- https://store.steampowered.com/app/370360/TIS100/
- Grid of nodes with arrows showing data flow
- Visual clarity of data flowing through designed system

### Forest App -- Growth Visualization
- https://www.forestapp.cc
- Trees growing over time, dead trees for failures
- Map should visually improve as more tasks complete

---

## Visual Design Principles (from research)

### Color Palette
- Primary: Dark backgrounds (HyperVault, Bitburner, BTD6 dark maps)
- Accent: Neon highlights per project (from /calendar color coding)
- Difficulty: BTD balloon colors (Red > Blue > Green > Yellow > Pink > Rainbow > MOAB)
- Status: Green=active, Yellow=warning, Red=failed (universal)

### Animation Priorities
1. Balloon movement along path (continuous)
2. Tower firing at balloons (satisfying pop)
3. Economy ticker (money up/down)
4. Tower upgrade flash
5. Wave announcement
6. MOAB arrival (dramatic)

### UI Layout (from BTD6)
- Map center, tower menu right sidebar
- Economy/lives/round top bar
- Speed controls bottom
- Agent BTD: project map center, agent select right, STATUS.md metrics top

### Must-Have Visual Feedback
1. Pop animation on task complete (BTD)
2. Range circle on agent select (BTD)
3. Eco ticker counting up (BTD Battles)
4. Wave preview for upcoming tasks (BTD)
5. Lives lost on missed task (BTD)
6. Upgrade tree per agent (BTD)

---

## Links to Watch/Study

### Videos
- BTD6: YouTube "BTD6 expert map gameplay"
- BTD Battles 2: YouTube "BTD Battles 2 eco guide"
- Factorio: YouTube "Factorio megabase tour"
- Screeps: https://screeps.com/a/#!/map (live)

### Live Demos
- Bitburner: https://bitburner-official.github.io
- Habitica: https://habitica.com
- Screeps tutorial: https://screeps.com/a/#!/sim/tutorial

### Repos to Clone and Study
1. https://github.com/Michaelliv/claude-quest (JSONL + game rendering)
2. https://github.com/HillviewCap/clog (Claude Code log viewer)
3. https://github.com/Pardesco/hypervault (Three.js project viz)
4. https://github.com/philipp-meier/TowerDefense (TS TD mechanics)
5. https://github.com/GantisStorm/essentials-claude-code (agent swarm monitoring)
