---
name: wins
description: Win tracker — fights the amnesia defense by making wins impossible to forget. Tracks streaks and compound effects.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(date*)
---

# Wins — Victory Tracker

The Puer's most dangerous weapon is the amnesia defense: making the CEO forget what he's accomplished, so nothing feels real, so why bother finishing the next thing? This skill is the antidote. Every win is recorded. Every streak is tracked. The compound effect is made visible.

## Modes

### Default: `/wins` — Show All Wins
1. Read `wins.md`
2. Scan day logs for completed items, shipped projects, collected payments
3. Display wins chronologically with streaks and stats

### Add Mode: `/wins add [description]`
1. Append the win to `wins.md` with today's date
2. Auto-categorize: `shipped`, `paid`, `milestone`, `personal`, `habit`
3. Check for compound chains (did this win lead to something else?)
4. Confirm: `Win logged: [description] ([category])`

### Compound Mode: `/wins chain`
Show wins that led to other wins:
- Garage33 shipped -> Mo's brother referral -> new deal
- This makes the invisible momentum visible.

## wins.md Format

```markdown
# Wins

> The antidote to amnesia. Nothing gets forgotten here.

| # | Date | Win | Category | Compound |
|---|------|-----|----------|----------|
```

Each entry:
```
| [n] | YYYY-MM-DD | [description] | [category] | [what it led to, or —] |
```

## Output Format (Default Mode)

```
## Win Report — [Date]

### Recent Wins
| # | Date | Win | Category |
|---|------|-----|----------|
(last 10 wins, newest first)

### Stats
- **Total wins**: [X]
- **Last win**: [date] ([X] days ago)
- **Current streak**: [X] days with at least one win
- **Longest streak**: [X] days
- **This week**: [X] wins
- **This month**: [X] wins

### Compound Chains
[Win] -> [led to] -> [led to]

### Wins by Category
- Shipped: [X]
- Paid: [X]
- Milestone: [X]
- Personal: [X]
- Habit: [X]
```

### Drought Warning
If no wins in 7+ days:
```
**Drought**: Last win was [X] days ago.
The Actualized Outcome Rule: nothing is real until it crosses the finish line.
What's closest to done right now? Ship that.
```

## Rules

- A win must be FINISHED. 90% done is not a win. The Actualized Outcome Rule applies.
- Collecting payment counts as a win (category: `paid`).
- Shipping a project counts (category: `shipped`).
- Hitting a personal goal counts (category: `personal`).
- Building a streak of daily habits counts (category: `habit`).
- Completing a meaningful milestone counts (category: `milestone`).
- When showing wins, always calculate days since last win. This is the most important number.
- If wins are sparse, don't lecture. Just show the data. The CEO sees his own patterns.
- If `wins.md` doesn't exist, create it with the template and seed with known wins from day logs.
