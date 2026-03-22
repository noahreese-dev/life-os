---
name: blockers
description: Surface all current blockers across all projects with actions needed
disable-model-invocation: true
allowed-tools: Read, Glob, Grep
---

# Blocker Report — Life-OS Chief of Staff

Scan all projects and surface every active blocker.

## Steps

1. Read `STATUS.md` for known blockers
2. Read each project's `ASSESSMENT.md` for technical/business blockers
3. Categorize and prioritize

## Output Format

```
## Blocker Report — [Date]

### CRITICAL (Blocking funded/deadline projects)
| # | Project | Blocker | Type | Owner | Action | ETA |
|---|---------|---------|------|-------|--------|-----|
| 1 | ... | ... | Business/Technical/Decision | Human/Agent | ... | ... |

### IMPORTANT (Blocking progress but not urgent)
| # | Project | Blocker | Type | Owner | Action | ETA |
|---|---------|---------|------|-------|--------|-----|

### WATCH (Potential future blockers)
| # | Project | Risk | Mitigation |
|---|---------|------|------------|

### Recommended Actions (in priority order)
1. [Most impactful unblock action]
2. [Second most impactful]
3. [Third]

### Blockers Resolved Since Last Check
- (any that were cleared)
```

Be specific. "Needs backend" is not a blocker — "No Supabase project created, no tables defined, no auth configured" is.
