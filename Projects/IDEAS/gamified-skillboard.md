# Gamified Skillboard — Life-OS Enhancement (Phase 2)

> Captured: Feb 14, 2026. Build AFTER Phase 1 (phone locked, funded projects shipped).

## Concept
A gamified mini website that tracks mastery of two skill domains through interactive checklists, tips, and progress tracking.

## Two Starting Skill Trees

### 1. Human Habits (Behavioral Rules)
Rules for how Noah operates during digital work. Not aspirational — enforceable.

Examples:
- "Thou shall not scroll after prompting" — no phone while waiting for Claude Code to run
- "Thou shall not open social media between work blocks"
- "Thou shall close the laptop before midnight"
- "Thou shall check screen time before end-of-day log"
- "Thou shall price before work" (from DEALCRAFT.md)
- "Thou shall write it down" (scope before starting)

### 2. General Setup & Wiring (Technical Configuration)
Checklist for properly configuring Claude Code, OpenClaw, MCP, and Life-OS tools.

Examples:
- MCP servers installed and configured (Desktop Commander, Supabase, etc.)
- Custom subagents defined in .claude/agents/
- Life-OS skills all functional (/morning, /end-of-day, etc.)
- OpenClaw running on Mac Mini with secure access path
- Environment variables and API keys properly managed
- Git repos clean and committed

## Design Direction
- Premium dark mode (consistent with IM/Noah aesthetic)
- Progress bars / XP system for completing checklist items
- Daily streak tracking tied to Digital Transcendence Score
- Simple, single-page — not over-engineered

## Stack
- Could be a simple HTML file in Life-OS (like /calendar generates)
- Or an Astro micro-site if it grows

## Status: PARKED
Build this in Phase 2 (March) after funded projects are shipped and phone discipline is established. The gamification only works if the foundation habits exist first.
