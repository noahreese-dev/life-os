---
name: decide
description: Decision journal — records decisions, options, reasoning. Builds institutional memory across sessions.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Bash(date*)
---

# Decide — Decision Journal

Decisions evaporate between sessions. The CEO makes a call, forgets why, second-guesses later. This skill creates institutional memory: every meaningful decision is recorded with its reasoning, so future sessions can reference what was decided and why.

## Modes

### Record Mode: `/decide [decision description]`
Walk the CEO through a structured decision capture:

1. **What's the decision?** (from the argument, or ask)
2. **What are the options?** (list 2-4 options considered)
3. **What was chosen?** (the actual decision)
4. **Why?** (the reasoning — this is the most important field)
5. **Expected outcome** (what should happen if this decision is right?)
6. **Deadline/check-in** (when should we evaluate this decision?)

Append to `decisions.md` and confirm: `Decision recorded: [summary]`

### Quick Mode: `/decide quick [decision]`
For small decisions that don't need the full framework:
- Record the decision, the date, and a one-line reason
- Skip the options/expected outcome fields
- Confirm in one line

### Review Mode: `/decide review`
1. Read `decisions.md`
2. Show all decisions with pending check-in dates
3. For each past-due check-in: ask "What actually happened?"
4. Fill in the Actual Outcome column
5. Calculate decision accuracy: right / total reviewed

### List Mode: `/decide list`
Show all recorded decisions, newest first, in a clean table.

## decisions.md Format

```markdown
# Decision Journal

> What was decided, why, and whether it worked. Institutional memory.

---

## [YYYY-MM-DD] — [Decision Title]

**Options considered:**
1. [Option A]
2. [Option B]
3. [Option C]

**Chosen:** [Option X]

**Why:** [Reasoning]

**Expected outcome:** [What should happen]

**Check-in date:** [When to evaluate]

**Actual outcome:** [Filled in later during /decide review]

---
```

## Output Format (Review Mode)

```
## Decision Review — [Date]

### Decisions Due for Review
| # | Date | Decision | Expected | Check-in | Status |
|---|------|----------|----------|----------|--------|
(decisions with check-in dates in the past)

### Decision Track Record
- **Total recorded**: [X]
- **Reviewed**: [X]
- **Right calls**: [X] / [reviewed] ([%])
- **Wrong calls**: [X] — lessons: [brief]

### Recent Decisions
(last 5, newest first)
```

## Rules

- Not every micro-decision needs recording. Focus on decisions that:
  - Involve money ($500+)
  - Affect project direction
  - Involve saying yes/no to opportunities
  - The CEO might second-guess later
  - Are reversible vs irreversible (flag irreversible ones)
- The "Why" field is the most valuable. Push for real reasoning, not "it felt right."
- If `decisions.md` doesn't exist, create it with the template.
- During review, be honest about outcomes. If a decision was wrong, that's valuable data.
- Never judge past decisions harshly — the goal is learning, not self-flagellation.
- Tag irreversible decisions with `[IRREVERSIBLE]` in the title.
