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
Garage33        [████████████████████░░] 90%  — Needs: build test, client feedback
Hardware Ad +   [██████████████████░░░░] 80%  — Needs: script lock, final render
UltrawashAPP    [████████████░░░░░░░░░░] 55%  — Needs: backend, payments, kiosk

### Wave 2: BUILD
IntelligenceMasters [████████░░░░░░░░░░░░] 40%  — Needs: contact, orb, bounty board

### Wave 3: GROW
AFF             [░░░░░░░░░░░░░░░░░░░░░░] 0%
Finance w/ Dan  [░░░░░░░░░░░░░░░░░░░░░░] 0%
ImageDesignAPP  [░░░░░░░░░░░░░░░░░░░░░░] 0%

### Revenue Status
| Project | Revenue | Status |
|---------|---------|--------|
| Garage33 | Pending | Ship to collect |
| Hardware Ad + | Pending | Deliver to collect |
| UltrawashAPP | Pending | Backend needed |

### Overall Life-OS Health: [Assessment]
```
