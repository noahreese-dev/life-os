# Agent BTD — Landscape Research

> Generated: Feb 24, 2026

## Key Finding

**Agent BTD occupies a genuinely empty niche.** ~10 projects combine Claude Code with game concepts, but only 2-3 are "game-as-interface," and none use tower defense mechanics or connect to real task management data.

## Two Categories in the Space

### Category 1: Claude Code FOR Game Development (majority)
Using Claude Code as a tool to make games. NOT what we're doing.

### Category 2: Game Interfaces FOR Claude Code (small, relevant group)
Using game visuals to represent Claude Code activity. **This is our space.**

## Key Projects Found

### Directly Relevant (Game-as-Interface)

**1. Claude Quest** — https://github.com/Michaelliv/claude-quest
- RPG-style pixel-art animation viewer for Claude Code sessions
- Go + Raylib, reads JSONL conversation logs
- Action-to-animation mapping (file read → spell cast, bash → attack, error → damage)
- Mana bar = context window capacity
- **Takeaway**: Proved the JSONL monitoring approach works. Viewer only, not strategic.

**2. ccworkspace / Agent Office Game** — https://github.com/pknull/ccworkspace (13 stars, GDScript/Godot)
- "Claude Code workspace with Agent Office game"
- Uses Godot game engine
- **Closest existing project to Agent BTD** — game visualization of agent workspace activity using a real game engine
- **Worth a deep-dive**

**3. Hypervault** — https://github.com/Pardesco/hypervault
- 3D cyberpunk city dashboard for Obsidian
- Visualize projects as buildings, monitor AI agents in real-time
- Launch Claude Code with a right-click
- **Key precedent**: game-like 3D visualization of real project data from markdown files

### Claude Code + Game Concepts (less directly relevant but informative)

**4. Claude Code Game Master** — https://github.com/Sstobo/Claude-Code-Game-Master (84 stars, Python)
- "Total conversion for Claude Code. Use RAG and RPG ruleset APIs to play persistent adventures."
- Turns Claude Code itself into a game engine

**5. Claude-Code-Game-Studios** — https://github.com/Donchitos/Claude-Code-Game-Studios (5 stars)
- 48 AI agents, 36 workflow skills, complete coordination system mirroring real studio hierarchy
- Multi-agent orchestration template

**6. Skills Weaver** — https://github.com/nicmarti/skills-weaver (15 stars, Go)
- RPG built directly on the Claude Code Agent SDK

**7. Unity-MCP** — https://github.com/IvanMurzak/Unity-MCP (1,065 stars, C#)
- MCP bridge between Claude Code and Unity Editor
- Largest Claude Code + game project by stars

**8. Essentials Claude Code** — https://github.com/GantisStorm/essentials-claude-code
- Workflow plugin with "Ralph TUI for dashboard" — visual monitoring

## The Gap Agent BTD Fills

Nobody is:
- Using **tower defense** as the metaphor
- Connecting to **real task/project management data** from markdown files
- Building an **economy/compounding system** tied to actual productivity metrics
- Making the game **strategic** (placement, upgrades, resource management) rather than just visual

Agent BTD sits at the intersection of all four gaps.

## Broader Ecosystem (Non-Claude-Code)

- **Habitica** — Gamified habit tracker. RPG mechanics for real habits. Proven model but generic.
- **Forest App** — Focus timer with tree-growing mechanic. Simple but effective.
- **Screeps** — Programming RTS where you write JavaScript to control units. Closest to "game IS the work."
- **Shenzhen I/O / TIS-100** — Programming puzzle games. Coding as gameplay.
- **CodeCombat** — Learn programming through game levels.
