---
name: schedule
description: Build a detailed time-blocked schedule for today or a specific day
disable-model-invocation: true
argument-hint: [today / tomorrow / monday / etc.]
allowed-tools: Read, Glob, Write, Bash(date*)
---

# Schedule Builder — Life-OS Chief of Staff

Build a detailed, time-blocked schedule for $ARGUMENTS (default: today).

## Steps

1. Read `STATUS.md` for current project states and blockers
2. Read `WEEKLY-LOG.md` for this week's commitments
3. Read `PRIORITIES.md` for priority rules
4. Consider the weekly rhythm from `CHIEF-OF-STAFF.md`

## Rules

- **Max 2 projects per day** — context switching kills momentum
- **90-minute deep work blocks** — no shorter for real work
- **Funded + deadline projects first** — always
- **Include breaks** — human needs to eat and move
- **Include a buffer block** — things always take longer than expected
- **If blocked on primary, have a fallback** ready

## Output Format

Generate a clean schedule AND offer to create an HTML calendar file.

```
## Schedule for [Day, Date]

### Theme: [What today is about in one line]

| Time | Block | Project | Task |
|------|-------|---------|------|
| 9:00 - 9:15 | Briefing | Life-OS | Morning check-in |
| 9:15 - 10:45 | Deep Work 1 | [Project] | [Specific task] |
| 10:45 - 11:00 | Break | — | Move, water, fresh air |
| 11:00 - 12:30 | Deep Work 2 | [Project] | [Specific task] |
| 12:30 - 1:30 | Lunch | — | Eat. Don't work. |
| 1:30 - 3:00 | Deep Work 3 | [Project] | [Specific task] |
| 3:00 - 3:15 | Break | — | — |
| 3:15 - 4:00 | Admin/Light | [Project] | [Light tasks, emails, decisions] |
| 4:00 - 4:15 | End of Day | Life-OS | Log what happened |

### Fallback Plan
If blocked on [Primary], switch to [Alternative].

### One Decision to Make Today
[Surface the most important pending decision]
```

After showing the schedule, ask if the user wants an HTML calendar generated.
