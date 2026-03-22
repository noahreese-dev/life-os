---
name: capture
description: Universal inbox — zero-friction GTD capture for ideas, tasks, follow-ups. ADHD-optimized.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash(date*)
---

# Capture — Universal Inbox

The CEO just threw out an idea, task, or random thought. Catch it instantly and get back to whatever he was doing. Zero friction. Zero lost ideas. This fights the ADHD amnesia loop.

## Trigger Phrases
- "capture this"
- "add this to inbox"
- "remind me to..."
- "idea:"
- "note to self"
- Any random idea mid-conversation that needs to be saved

## Steps

### 1. Parse the Input
Extract from the CEO's message:
- **What**: The actual idea/task/note (keep it concise, his words)
- **Category**: Auto-tag one of: `project`, `idea`, `follow-up`, `task`, `someday`, `question`
- **Context**: If it relates to a known project, tag it (e.g., `#garage33`, `#boz`)

### 2. Write to Inbox
- Open `inbox.md` at the Life-OS root
- If it doesn't exist, create it with the header template below
- Append a new entry at the TOP of the list (newest first)
- Use the current timestamp

### 3. Confirm
One line only: `Captured: [summary] -> inbox.md`

Do NOT elaborate. Do NOT suggest next steps. Do NOT ask follow-up questions. Just capture and confirm.

## inbox.md Format

If creating for the first time:

```markdown
# Inbox

> Universal capture. Process weekly. Nothing gets lost.

| Date | Item | Category | Context | Processed |
|------|------|----------|---------|-----------|
```

Each new entry:

```
| YYYY-MM-DD HH:MM | [item text] | [category] | [context or —] | [ ] |
```

## Rules

- **Speed is everything.** Capture in under 2 seconds of processing time.
- Never ask "do you want me to capture this?" — if the CEO says capture, just do it.
- If invoked with no argument, ask: "What do you want to capture?" — one question, nothing more.
- Keep item text SHORT. The CEO's exact words, trimmed to essence. Max 15 words.
- The `Processed` column stays unchecked until weekly review clears it.
- If an item clearly maps to an existing project, add the project tag in Context.
- Multiple captures in one message are fine — add them all.
