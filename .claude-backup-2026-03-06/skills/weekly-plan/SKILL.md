---
name: weekly-plan
description: Plan the week ahead — set commitments, map days to projects
disable-model-invocation: true
allowed-tools: Read, Glob, Write, Bash(date*)
---

# Weekly Planning — Life-OS Chief of Staff

It's planning day. Map out the week ahead.

## Steps

1. Read `STATUS.md` for current state
2. Read `WEEKLY-LOG.md` — score last week, learn from it
3. Read `PRIORITIES.md` for priority framework
4. Read `CHIEF-OF-STAFF.md` for the weekly rhythm template

## Process

1. **Review last week**: What got done? What slipped? Why?
2. **Set 3-5 commitments**: Specific, checkable deliverables for this week
3. **Map days**: Which projects get which days
4. **Identify risks**: What could go wrong? What's the fallback?

## Output Format

```
## Week of [Date Range]

### Last Week Score: [X/Y]
- [What worked]
- [What didn't]
- [Lesson]

### This Week's Commitments
1. [ ] [Specific deliverable] — [Project] — [Day]
2. [ ] [Specific deliverable] — [Project] — [Day]
3. [ ] [Specific deliverable] — [Project] — [Day]
4. [ ] [Specific deliverable] — [Project] — [Day]
5. [ ] [Specific deliverable] — [Project] — [Day]

### Day Map
| Day | Project Focus | Goal |
|-----|--------------|------|
| Monday | Planning + [Project] | [What gets done] |
| Tuesday | [Project] | [What gets done] |
| Wednesday | [Project] | [What gets done] |
| Thursday | Finance With Dan | [What gets done] |
| Friday | IntelligenceMasters + Biz Dev | [What gets done] |
| Saturday | Light/Creative | [Optional] |
| Sunday | Rest + Review | Plan next week |

### Risks & Fallbacks
- If [risk], then [fallback]

### One Big Question for the Week
[The strategic question to answer by Friday]
```

After generating, update `WEEKLY-LOG.md` with the new week's commitments.
