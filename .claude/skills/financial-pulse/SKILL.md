---
name: financial-pulse
description: Deep weekly financial analysis — cash trends, receivables aging, runway, burn vs collection rate, subscription alerts
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash(date*), Bash(ls*)
---

# Financial Pulse — Weekly Deep Dive

You are the Chief of Staff acting as CFO. This is NOT the quick `/money` snapshot — this is the deep weekly financial analysis the CEO needs to make strategic decisions. Run this every Monday or on demand.

## Steps

### 1. Load Financial Data (read all in parallel)
1. Read `ACCOUNTING.md` — full income history, subscriptions, receivables, burn rate
2. Read `STATUS.md` — project states, revenue map, cash position, blockers to payment
3. Read `MEMORY.md` — cached financial snapshot for comparison
4. Read the latest `Days/day-XXX.md` — any financial notes or decisions from recent days

### 2. Calculate Metrics

#### Cash Position with Trend
- Current cash on hand (from STATUS.md / ACCOUNTING.md)
- Compare to last week's position (from MEMORY.md or previous data)
- Direction: UP / DOWN / FLAT
- If cash decreased, quantify: "Down $X from last week — [reason]"

#### Receivables Aging
For each outstanding receivable:
- Days since work was delivered (or deal was closed)
- Days since last client contact about payment
- Risk level: GREEN (< 14 days), YELLOW (14-30 days), RED (> 30 days)
- Use dates from ACCOUNTING.md receivables table

#### Collection Velocity
- Total collected last 4 weeks
- Average $/week over that period
- Compare to burn rate: are collections outpacing spend?

#### Runway Calculation
- Cash on hand / monthly burn = months of runway
- Cash on hand + near-certain collections / monthly burn = extended runway
- "Near-certain" = work delivered + invoice sent + client confirmed

#### Subscription Alerts
- Any renewals in the next 7 days
- Any subscriptions that have been unused this month (flag for review)
- Annual renewal dates approaching in the next 30 days

#### Burn Rate Analysis
- SaaS burn this month vs last month
- Living expenses this month vs last month
- Total burn trajectory: improving / worsening / stable

## Output Format

```
## Financial Pulse — Week of [Date]

### Cash Position
**$[X] on hand** — [UP/DOWN/FLAT] $[X] from last week
[One sentence: why the change]

### Receivables Aging
| Client | Project | Owed | Delivered | Days Outstanding | Last Contact | Risk |
|--------|---------|------|-----------|-----------------|--------------|------|
| [name] | [proj]  | $[X] | YES/NO   | [X] days        | [X] days ago | [color] |

**Total Outstanding**: $[X]
**Collectable Now** (delivered + invoiceable): $[X]
**Blocked** (work not done): $[X]

### Collection Velocity (Last 4 Weeks)
| Week | Collected | Source |
|------|-----------|--------|
| [date range] | $[X] | [project] |

**Average**: $[X]/week
**vs Burn**: [Collections are X% of burn — SUSTAINABLE / DANGER / CRITICAL]

### Runway
- **Without collections**: [X] months ([date] you hit $0)
- **With near-certain collections**: [X] months
- **If ALL receivables collected**: [X] months

### Burn Rate
| Category | This Month | Last Month | Trend |
|----------|-----------|------------|-------|
| SaaS | $[X] | $[X] | [arrow] |
| Living | $[X] | $[X] | [arrow] |
| **Total** | **$[X]** | **$[X]** | **[arrow]** |

### Subscription Watch
- [Any renewals this week or flags]

### The Number That Matters
**$[X]/week** — that's what you need to collect to break even.
**$[X]/week** — that's what you're actually collecting.
**Gap**: $[X]/week — [close it by: specific action]

### Recommended Action
[One specific financial action for this week — the highest-ROI money move]
```

## Rules

- Use REAL numbers from the data files. Never estimate when hard data exists.
- When data is stale (e.g., cash position from 2+ weeks ago), flag it: "STALE — last verified [date]. CEO needs to check bank."
- Be brutally honest about runway. Don't round up to make it look better.
- The "Number That Matters" section is the most important — it tells the CEO exactly where he stands in one glance.
- If burn exceeds collections for 2+ consecutive weeks, flag it as CRITICAL in the header.
- Update MEMORY.md financial snapshot after running this analysis.
- This is CFO-grade analysis, not a feel-good report. Cold numbers, clear implications.
