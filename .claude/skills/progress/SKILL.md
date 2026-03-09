---
name: progress
description: Quick snapshot of all project progress with percentage estimates
disable-model-invocation: true
allowed-tools: Read, Glob
---

# Progress Snapshot — Life-OS Chief of Staff

Quick visual of where every project stands.

## Steps

1. Read `STATUS.md` and all `ASSESSMENT.md` files
2. Estimate completion percentage based on what's built vs. what's needed

## Output Format

```
## Life-OS Progress — [Date]

### Wave 1: SHIP (Funded)
[Project A]     [████████████████████░░] XX%  — Needs: [from ASSESSMENT.md]
[Project B]     [██████████████████░░░░] XX%  — Needs: [from ASSESSMENT.md]
[Project C]     [████████████░░░░░░░░░░] XX%  — Needs: [from ASSESSMENT.md]

### Wave 2: BUILD
[Project D]     [████████░░░░░░░░░░░░░░] XX%  — Needs: [from ASSESSMENT.md]

### Wave 3: GROW
[Future projects from STATUS.md]

### Revenue Status
| Project | Revenue | Status |
|---------|---------|--------|
| [Read from STATUS.md] | | |

### Overall Life-OS Health: [Assessment]
```
