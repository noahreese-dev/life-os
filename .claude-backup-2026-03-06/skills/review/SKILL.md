---
name: review
description: Code health check — review a project's codebase for issues, debt, and ship-readiness
disable-model-invocation: true
argument-hint: [project name]
allowed-tools: Read, Glob, Grep, Bash(npx*), Bash(npm run*), Bash(node*)
---

# Code Review — Life-OS Chief of Staff

Run a health check on $ARGUMENTS project codebase. Not a line-by-line review — a CTO-level assessment of ship-readiness.

## Steps

1. Read `STATUS.md` to find the codebase location
2. Read the project's `ABOUT.md` and `ASSESSMENT.md` for context
3. Check the codebase:
   - `package.json` — dependencies, scripts, versions
   - Build test — does it compile/build without errors?
   - Look for TODO/FIXME/HACK comments
   - Check for .env files or hardcoded secrets
   - Check for broken imports or dead code
   - Review error handling in critical paths
   - Check if tests exist and pass
4. Generate the health report

## Output Format

```
## Code Review — [Project Name]
**Codebase**: [path]
**Stack**: [tech stack]
**Last reviewed**: [date]

### Build Status
- [ ] Builds without errors
- [ ] No TypeScript/lint errors
- [ ] Dependencies up to date (no critical vulns)

### Ship Readiness: [RED / YELLOW / GREEN]

#### What Works
- [Feature 1] — working
- [Feature 2] — working

#### What's Broken
- [Issue 1] — [severity] — [fix estimate]
- [Issue 2] — [severity] — [fix estimate]

#### Technical Debt
- [Debt item 1] — [impact: low/med/high]
- [Debt item 2] — [impact: low/med/high]

#### Security Check
- [ ] No hardcoded secrets
- [ ] No exposed API keys
- [ ] Auth properly implemented
- [ ] Input validation present

#### TODOs Found
- [file:line] — [todo text]

### Verdict
[One paragraph: Can this ship? What must be fixed first? What can wait?]

### Next 3 Actions
1. [Most critical fix]
2. [Second priority]
3. [Third priority]
```

## Tone

Technical and precise. Think senior engineer doing a pre-deployment audit. Flag real issues, ignore style preferences.
