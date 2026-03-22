---
name: review-week
description: Structured weekly retrospective — scores, trends, patterns, ship rate. Backward-looking complement to /weekly-plan.
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Grep, Bash(date*), Bash(ls*)
---

# Weekly Review — Structured Retrospective

This is the backward-looking complement to `/weekly-plan`. What actually happened this week? Where did we ship, stall, repeat? This skill builds institutional memory and surfaces the patterns that compound over time.

## Steps

### 1. Gather Data (all reads in parallel)
1. Find all `Days/day-XXX.md` files from the last 7 days
2. Read each one — extract scores, completed items, avoided items, patterns
3. Read `STATUS.md` for project state changes
4. Read `WEEKLY-LOG.md` for what was planned this week
5. Read previous `Reviews/` entries if they exist (for trend comparison)
6. Read `wins.md` if it exists
7. Read `waiting.md` if it exists

### 2. Calculate Metrics
From the day logs:
- **Average Execution Score** (1-5) + trend arrow vs last week
- **Average Focus Score** (1-5) + trend arrow
- **Average Energy Score** (1-5) + trend arrow
- **Average Digital Transcendence Score** (1-5) + trend arrow (both CoS and CEO)
- **Ship Score**: items that crossed the finish line / total contract items committed to
- **Days logged**: X / 7 (consistency itself is a metric)

### 3. Analyze Patterns
- **What shipped**: List every completed deliverable, collected payment, finished task
- **What stalled**: Items that appeared in contracts but never got done
- **Patterns repeated**: Cross-reference OCTOPUS.md arms — which showed up this week?
- **Best day**: Which day had the highest scores? What was different?
- **Worst day**: Which day had the lowest? What happened?

### 4. 4Ls Framework
- **Loved**: What felt good this week? What energized the CEO?
- **Learned**: What new insight, skill, or self-knowledge emerged?
- **Lacked**: What was missing? Resources, discipline, clarity, sleep?
- **Longed for**: What does the CEO wish had been different?

(If day log data is rich enough, infer these. Otherwise, note what's missing.)

### 5. Generate the One Pattern
Identify the **#1 pattern to break next week**. Be specific:
- Not "be more focused" but "Phone usage before 10am killed 3 of 5 mornings"
- Not "finish things" but "70% trap hit on HW Ad+ for the 3rd week — the render is the door"

## Output Format

```
## Weekly Review — Week of [Date Range]

### Scores
| Metric | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Avg | Trend |
|--------|-----|-----|-----|-----|-----|-----|-----|-----|-------|
| Execution | | | | | | | | X.X | [arrow] |
| Focus | | | | | | | | X.X | [arrow] |
| Energy | | | | | | | | X.X | [arrow] |
| Digital (CoS) | | | | | | | | X.X | [arrow] |
| Digital (CEO) | | | | | | | | X.X | [arrow] |

**Ship Score**: X / Y ([percentage]%)
**Days Logged**: X / 7

### What Shipped
- [item] — [date]

### What Stalled
- [item] — stuck because [reason]

### Patterns
- [pattern 1]
- [pattern 2]

### 4Ls
- **Loved**: [...]
- **Learned**: [...]
- **Lacked**: [...]
- **Longed for**: [...]

### #1 Pattern to Break Next Week
[Specific, actionable pattern with evidence]

### Best Day: [Day] — [why]
### Worst Day: [Day] — [why]
```

### 6. Save the Review
Save the output to `Reviews/week-[YYYY-MM-DD].md` (create `Reviews/` folder if needed). This builds a longitudinal record.

## Rules

- If fewer than 3 day logs exist for the week, note the gaps. Consistency of logging is itself data.
- Trend arrows: compare to previous week's review if it exists. If no prior review, note "baseline week."
- Be honest about the Ship Score. Partial completion = not shipped. The Actualized Outcome Rule applies.
- Don't inflate. If it was a bad week, say so with compassion but without sugar.
- Keep the output scannable — the CEO should get the picture in 30 seconds.
