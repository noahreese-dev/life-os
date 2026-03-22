---
name: waiting
description: Track everything the CEO is waiting on from other people. Surface stale items. Nudge follow-ups.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(date*)
---

# Waiting-On Tracker

The CEO's biggest bottleneck isn't his own output — it's other people not responding. This skill makes the invisible visible: who owes what, how long it's been, and what to do about it.

## Modes

### Default: `/waiting` — Show All Open Items
1. Read `STATUS.md`, latest `Days/day-XXX.md`, and scan `People/` folder if it exists
2. Read `waiting.md` if it exists
3. Compile every open "waiting on" item from all sources
4. Output the tracker table

### Add Mode: `/waiting add [person] [what]`
1. Parse person name and what you're waiting for
2. Append to `waiting.md` with today's date
3. Confirm: `Added: Waiting on [person] for [what] (Day 0)`

### Resolve Mode: `/waiting done [person]` or `/waiting done [item number]`
1. Mark the item as resolved in `waiting.md` with today's date
2. Confirm: `Resolved: [person] — [what]`

## waiting.md Format

```markdown
# Waiting On

> Everything the CEO is waiting on from other people. Updated by /waiting skill.

| # | Person | What | Since | Status |
|---|--------|------|-------|--------|
| 1 | [name] | [description] | YYYY-MM-DD | OPEN |
```

When resolved, change Status to `DONE [date]`.

## Output Format (Default Mode)

```
## Waiting-On Report — [Date]

### RED (14+ days — needs escalation)
| # | Person | What | Since | Days | Suggested Action |
|---|--------|------|-------|------|-----------------|

### YELLOW (7-14 days — nudge needed)
| # | Person | What | Since | Days | Suggested Action |
|---|--------|------|-------|------|-----------------|

### GREEN (< 7 days — on track)
| # | Person | What | Since | Days |
|---|--------|------|-------|------|

**Total**: [X] open items | [X] overdue
**Oldest**: [person] — [what] ([X] days)
**Suggested next action**: [most impactful follow-up]
```

## Known Waiting Items (seed data — update as resolved)
These are known as of Mar 14, 2026. Check if still current:
- Garage33 final payment from Mo (since ~Mar 8)
- Boz scope doc response (since ~Feb 23)
- ICS/Summer API pricing for Ultrawash (since early Mar)
- Mo's brother project scoping (new lead, since ~Mar 8)

## Rules

- Calculate days waiting from the `Since` date to today.
- RED = 14+ days. YELLOW = 7-14 days. GREEN = < 7 days.
- For RED items, always suggest a specific follow-up action (not generic "follow up").
- If `waiting.md` doesn't exist, create it and seed with known items.
- Cross-reference STATUS.md blockers — many blockers are actually waiting-on items.
- Keep it honest: if the CEO is the one not responding, say so.
