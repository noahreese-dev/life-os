---
name: money
description: Financial snapshot — receivables, delivery status, and what's between you and getting paid
disable-model-invocation: true
allowed-tools: Read, Glob
---

# Money — Life-OS Chief of Staff

Show the financial reality. What's owed, what's earned, what's blocking payment.

## Steps

1. Read `STATUS.md` for project financials and delivery status
2. Read each funded project's `ABOUT.md` and `ASSESSMENT.md`
3. Calculate total pipeline, delivered vs undelivered, and blockers to collection

## Output Format

```
## Money — [Date]

### Pipeline Summary
| Project | Value | Delivered? | Blocker to Payment | ETA |
|---------|-------|------------|-------------------|-----|
| ... | $X | YES/NO/PARTIAL | [What's left] | [When] |

**Total Pipeline**: $[X]
**Delivered / Collectable Now**: $[X]
**Undelivered / In Progress**: $[X]

### What's Between You and Getting Paid

#### [Project 1]
- **Owed**: $X
- **What's left to deliver**: [Specific list]
- **Estimated hours of work**: [X]h
- **Blocker**: [What's actually stopping this]
- **Fastest path to invoice**: [Action]

#### [Project 2]
...

### Revenue Per Hour (Reality Check)
| Project | Value | Est. Hours Left | $/Hour |
|---------|-------|----------------|--------|
| ... | $X | Xh | $X/h |

### Recommended Focus (Maximize $/hour)
[Which project gives the best return on time invested right now]

### Cash Flow Note
[When can you realistically expect to collect each payment, and does that timeline work for your expenses?]
```

## Tone

Cold financial reality. No feelings about relationships here — just the numbers. This is your CFO view.
