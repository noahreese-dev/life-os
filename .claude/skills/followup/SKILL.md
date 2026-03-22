---
name: followup
description: Auto-draft follow-up messages based on wait time and context. Attacks the social-financial assertion bottleneck.
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash(date*)
---

# Follow-Up Message Drafter

The CEO's #1 avoidance pattern in the social-financial domain: he knows he needs to follow up but doesn't. This skill removes the friction by drafting the message for him. All he has to do is copy-paste and send.

## Trigger
`/followup [person or project name]`

## Steps

### 1. Gather Context
In parallel:
- Read `waiting.md` for how long this item has been waiting
- Read `STATUS.md` for project context
- Scan `People/` folder for any notes on this person
- Read latest day logs for recent mentions

### 2. Determine Tone
Based on days waiting:
- **< 7 days**: Friendly check-in. Light. "Hey, just circling back..."
- **7-14 days**: Direct. Clear ask. "Wanted to follow up on..."
- **14-30 days**: Firm. Sets a deadline. "Need to lock this down by..."
- **30+ days**: Urgent. States consequences. "We need to resolve this — here's what happens if we don't..."

### 3. Draft the Message
- Keep it SHORT. 3-5 sentences max.
- Reference the specific thing being waited on.
- Include a clear ask (what do you need from them?).
- Include a soft deadline where appropriate.
- Match the CEO's natural communication style (direct, professional, not corporate).
- If it's a money conversation, be direct about the amount.

### 4. Present for Approval
Output the message in a copy-paste ready block:

```
---
To: [Person]
Re: [Subject]
Via: [Text / Email / Call — recommend based on urgency]
Waiting: [X] days
---

[Message body]
```

Then ask: "Send as-is, adjust, or skip?"

## Examples

**Friendly (< 7 days):**
> Hey Mo, hope all is good. Just wanted to check in on the final payment for the Garage33 project — let me know if you need anything from my end to process it.

**Direct (7-14 days):**
> Mo, following up on the Garage33 final payment of $2,500. The project's been delivered and live. Can we get this processed this week?

**Firm (14-30 days):**
> Mo, I need to follow up on the outstanding $2,500 for Garage33. The site has been live for [X] weeks now. Can we lock in a payment date? I'd like to get this squared away by [date].

**Urgent (30+ days):**
> Boz, the scope doc for the app project has been sitting since February 23rd — that's [X] days. I need to know if this project is moving forward so I can plan my pipeline. Can we get on a call this week to finalize?

## Rules

- Never send on behalf of the CEO. Draft only. He sends.
- If the person isn't in `waiting.md`, still draft based on whatever context is available.
- For money follow-ups: always include the specific dollar amount.
- Don't soften money asks with excessive pleasantries. Be human but direct.
- If the CEO has been avoiding this follow-up, name it gently: "This one's been sitting. The draft is ready — just hit send."
- Recommend the communication channel: text for casual, email for formal, call for urgent/large amounts.
