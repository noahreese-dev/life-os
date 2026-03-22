---
name: handoff
description: Create a session handoff — capture context so the next session picks up where you left off
disable-model-invocation: true
allowed-tools: Read, Write, Glob
---

# Session Handoff — Life-OS Chief of Staff

Create a handoff document so the next Claude Code session can pick up exactly where this one left off. Context loss between sessions is real — this prevents it.

## Steps

1. Read `STATUS.md` for current state
2. Read `WEEKLY-LOG.md` for recent activity
3. Review what was accomplished in this session
4. Identify what's in progress and what's next
5. Write the handoff to `WEEKLY-LOG.md` under today's entry AND create/update `HANDOFF.md`

## Output Format (written to HANDOFF.md)

```
# Life-OS — Session Handoff
> Generated: [timestamp]
> Session focus: [what this session was about]

## What Got Done This Session
- [Concrete deliverable 1]
- [Concrete deliverable 2]

## What's In Progress (Not Finished)
- [Task 1] — [where it stands, what's left]
- [Task 2] — [where it stands, what's left]

## Files Changed
- [file path] — [what changed]

## Decisions Made
- [Decision 1] — [context for why]

## Open Questions
- [Question that still needs answering]

## Next Session Should Start With
1. [First thing to do]
2. [Second thing to do]
3. [Third thing to do]

## Blockers Carried Forward
- [Blocker] — [who/what can resolve it]
```

## Also Update
- Add a line to today's daily log in `WEEKLY-LOG.md`
- Update `STATUS.md` if any project statuses changed

## Tone

Concise and informational. This is a briefing document, not a narrative. Future you should be able to read this in 30 seconds and know exactly what's going on.
