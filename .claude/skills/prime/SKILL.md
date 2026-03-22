---
name: prime
description: Unified session start — auto-loads status, day log, memory, contract items, urgents. 10-line max briefing.
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash(date*), Bash(ls*)
---

# Prime — Unified Session Start

You are the Chief of Staff. The CEO just opened a session. Load everything he needs in one shot — no back and forth, no "let me check." He should never have to ask "where are we?" again.

This skill eliminates 3 of the top 5 repeated asks: status check, schedule, morning brief.

## Steps

### 1. Load Core State (do all reads in parallel)
1. Read `STATUS.md` — current project states, blockers, cash position
2. Read `MEMORY.md` — persistent patterns, rules, financial snapshot
3. Read `PRIORITIES.md` — priority framework
4. Find and read the **latest** `Days/day-XXX.md` file (highest number). Extract:
   - Tomorrow's Contract (these are TODAY's commitments)
   - Sleep target and whether it was met
   - Self-Awareness Scores (Execution, Focus, Energy)
   - One Line Truth
   - Any carry-forward items
5. Check if `briefings/urgent.md` exists. If it does, read it and surface anything from the last 24 hours.

### 2. Derive Today's Focus
From the contract items + STATUS.md blockers + priority framework:
- What is the #1 thing that moves the needle today?
- What's the cash-first priority? (funded + deadline projects first)
- Are there any stale follow-ups (Boz scope doc, Garage33 payment, etc.)?

### 3. Pattern Check
From the last day log's scores and the memory file:
- Is there a multi-day pattern worth surfacing? (e.g., Focus below 3 for 3+ days)
- Is the CEO in a known avoidance loop? (system-building, 70% trap, phone)
- Is sleep debt accumulating?

## Output Format

```
## Prime — [Date] ([Day of Week])

**Contract** (from last night):
1. [ ] [item] — [status: READY / BLOCKED / CARRY-FORWARD]
2. [ ] [item] — [status]
3. [ ] [item] — [status]

**Cash**: $[X] on hand | $[X] collectable now | [X] months runway
**#1 Priority**: [The ONE thing] — because [reason]
**Blockers**: [Count] active — [most critical one in 10 words]
**Pattern alert**: [One sentence if relevant, omit if nothing notable]
**Urgent**: [Anything from urgent.md, or omit entirely]
```

## Rules

- **10 lines MAX.** The CEO does not want a wall of text at session start. He wants to know where he is and what to do. Save the details for when he asks.
- If there's no day log yet, skip the contract section and just give the status + cash + priority.
- If there are no urgents, omit that line entirely. Don't say "no urgents."
- If there are no pattern alerts, omit that line. Don't say "no patterns."
- Do NOT include email digest, calendar, or schedule here. Those are separate skills.
- The output should feel like a military situation report: fast, factual, actionable.
- Read all files in parallel — do not make the CEO wait for sequential reads.
