---
name: commands
description: Show all available Life-OS Chief of Staff commands
disable-model-invocation: true
allowed-tools: Read
---

# Commands — Life-OS Chief of Staff

Display all available commands with descriptions.

## Steps

1. Read `CLAUDE.md` for the full command list

## Output Format

```
 ================================================
  Life-OS Chief of Staff — Command Reference
 ================================================

 DAILY OPERATIONS (→ daily-ops agent)
   /morning      — Daily briefing: status, focus, blockers, email digest, calendar
   /schedule     — Time-blocked schedule (e.g. /schedule today)
   /calendar     — Visual calendar → HTML + PDF + slides
   /end-of-day   — Log what happened, prep tomorrow
   /handoff      — Save session context for next session

 ANALYSIS (CoS direct)
   /blockers     — Surface all active blockers by severity
   /progress     — Project completion snapshot with progress bars
   /truth        — Unfiltered reality check, no sugar coating
   /money        — Financial snapshot: receivables, $/hour, payment blockers

 PLANNING (CoS direct)
   /weekly-plan  — Plan the week ahead (use on Mondays)
   /prep         — Meeting prep (e.g. /prep client-name call)
   /review       — Code health check (e.g. /review project-name)

 PSYCHE — PURE VOICE (→ personas agent)
   /jung         — Carl Jung: deep psychological counsel
   /ali          — Imam Ali: fire, justice, the sword of truth
   /hassan       — Imam Hassan: strategic patience, gentle wisdom

 PSYCHE-OS — FULL CoS + VOICE (CoS direct)
   /jungos       — Jung as Chief of Staff: full CoS through the analyst's lens
   /alios        — Ali as Chief of Staff: full CoS with the Commander's fire
   /hassanos     — Hassan as Chief of Staff: full CoS with the Sage's patience

 SYSTEM (→ meta agent)
   /commands     — This list

 AGENTS
   daily-ops     — Handles all daily rituals (morning, schedule, calendar, eod, handoff)
   personas      — Pure voice counsel (Jung, Ali, Hassan)
   meta          — System improvement, skill creation, workflow optimization
   CoS (main)    — Analysis, planning, psyche-OS, orchestration

 TIPS
   • Start every session with /morning
   • End every session with /handoff
   • Use /truth when you need a reality check
   • Use /prep before any client meeting
   • Use /money when you need to prioritize by revenue
   • Pure voice (/jung, /ali, /hassan) = counsel only, no tasks
   • OS voice (/jungos, /alios, /hassanos) = full CoS + persona
```
