# Agent BTD — Bloons Tower Defense Interface for AI Agents

> Concept captured: Feb 24, 2026
> Status: Vision / Design Phase — not active development

## The Idea

A gamified Bloons Tower Defense interface for managing AI agents. Instead of a terminal, you're playing a tower defense game where:

- **Monkeys = AI Agents** — each specialized (coder, researcher, writer, designer), placed strategically on the map
- **Balloons = Tasks & Goals** — come in waves of increasing difficulty, following a path (your timeline/roadmap)
- **Popping balloons = Completing tasks** — agents "pop" tasks by working on them
- **The path = Your roadmap** — if tasks reach the end unpopped, they're missed deadlines
- **Rounds/Waves = Phases & milestones** — difficulty increases as projects progress
- **Lives = Tolerance for failure** — too many dropped tasks and the system breaks

## The BTD Battles Economy Analogy (Key Insight)

In BTD Battles, you **send balloons at your opponent to earn money (eco)**. You deliberately take on challenges not just to attack but to grow your passive income rate. This maps perfectly:

| BTD Battles | Life-OS |
|-------------|---------|
| Send balloons to earn eco | Take on funded projects to earn revenue |
| Eco compounds over time | Revenue funds vision projects (compounding) |
| Farms = passive income towers | Automated agents running in background |
| Eco = active income from sending | Manual work / hustle / client deliverables |
| Over-ecoing leaves you vulnerable | Taking too many projects leaves you spread thin |
| Rush = all-in attack | Sprint to hit a deadline |
| Choose eco OR farms, not both | Choose depth OR breadth, not both |

**Core philosophy**: Invest your resources INTO your resources so they compound. Don't just pop balloons — build an economy that pops them for you.

## How It Would Work

### Visual Interface
- BTD-style map where the path = your project roadmap / timeline
- Monkey towers = your active AI agents (Claude Code instances, skills, automated workflows)
- Balloons entering = new tasks, deadlines, incoming work
- Color-coded balloons by project (like the calendar system)
- Difficulty tiers: Red (simple) → Rainbow (complex) → MOAB (major milestone)

### Gameplay Mechanics
- Place agents (monkeys) to handle specific task types
- Upgrade agents with better prompts, tools, skills
- Economy view: how much "income" your agents are generating vs. how much tasks are costing
- Wave preview: see upcoming tasks/deadlines before they arrive
- Lives remaining: how many tasks can slip before a project is at risk

### Integration Points
- Could read from Life-OS STATUS.md / task lists for real task data
- Could monitor Claude Code sessions (like Claude Quest does via JSONL logs)
- Could be a CLI skill that renders in-terminal or generates an HTML dashboard
- Eventually: a standalone app or web interface

## Reference Projects
- **Claude Quest** (https://github.com/Michaelliv/claude-quest) — Go-based RPG viewer for Claude Code sessions. Reads JSONL logs, maps tool calls to pixel-art animations. Viewer only, not strategic. Uses Raylib for rendering.
- **Bloons TD 6** — The full game. Monkey towers, 3 upgrade paths per tower, hero units, MOAB-class bloons, co-op mode.
- **BTD Battles 2** — PvP version with eco mechanics. The economy/compounding philosophy is strongest here.

## Why This Matters

1. **Noah genuinely loves BTD** — spending most time in Claude Code, having a BTD interface makes the work feel like play
2. **The analogy is structurally sound** — not a forced metaphor, the mechanics actually map to agent management
3. **Compounding philosophy** — BTD Battles' eco system mirrors the Life-OS investment thesis perfectly
4. **Potential product** — could become a skill/tool others use for their own agent workflows
5. **Digital Transcendence** — gamifying productive work instead of consuming games. Using the game to DO the work.

## Build Path (When Ready)

This is a P2/vision project. Earn it by shipping P0 deliverables first.

1. Start as a concept + static dashboard (HTML, like the /calendar output)
2. Add real data from Life-OS task tracking
3. Add Claude Code session monitoring (reference Claude Quest's JSONL approach)
4. Eventually: interactive placement, real-time agent management
5. Package as a reusable skill or standalone tool

## The Rule

**This is the novel thing. It has to be earned.** Ship the funded work first. This is the reward, not the escape.
