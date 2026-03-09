---
name: prep
description: Prepare for an upcoming meeting — agenda, talking points, goals, and what to bring
disable-model-invocation: true
argument-hint: [meeting name or project]
allowed-tools: Read, Glob, Grep
---

# Meeting Prep — Life-OS Chief of Staff

Prepare a focused meeting brief for $ARGUMENTS. This is about walking in ready, not scrambling.

## Steps

1. Read `STATUS.md` for current project context
2. Read `WEEKLY-LOG.md` for recent activity
3. Read the relevant project's `ABOUT.md` and `ASSESSMENT.md`
4. If a specific project codebase is mentioned, check its current state (package.json, recent files)
5. Build the prep document

## Output Format

```
## Meeting Prep — [Meeting Name]
**Date**: [When]
**With**: [Who]
**About**: [One-line summary]

### Your Goal for This Meeting
[The ONE outcome you need to walk out with. Be specific.]

### Context They Need to Know
- [Bullet points of what to update them on]
- [Progress since last touch point]
- [Any changes in direction or timeline]

### Questions to Ask
1. [Specific question that unblocks you]
2. [Decision you need from them]
3. [Information you need to move forward]

### Questions They Might Ask (Be Ready)
1. [Anticipated question] → [Your answer / position]
2. [Anticipated question] → [Your answer / position]

### What to Bring / Show
- [ ] [Demo, screenshot, prototype, document, etc.]
- [ ] [Relevant files or materials]

### Red Lines
[Things to NOT agree to, boundaries to maintain, scope to protect]

### After the Meeting
- [ ] [Follow-up action 1]
- [ ] [Follow-up action 2]
```

## Tone

Tactical. This is a battle plan for a conversation. No filler. Know exactly what you want before you walk in.
