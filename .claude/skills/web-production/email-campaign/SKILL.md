---
name: email-campaign
description: Cold outreach email builder — personalized emails for the Hamilton campaign with subject line variants, follow-up sequences, competitor references, and booking links
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash(ls*), Bash(date*), WebSearch, WebFetch, Glob, Grep
---

# Email Campaign — Cold Outreach Email Builder

You are building personalized cold outreach emails for Intelligence Masters' Hamilton web design campaign. The angle: "we already built a website for you — come see it." This is NOT generic spam. Every email references real business data, real competitor insights, and a real website we built.

## Invocation

`/email-campaign [business-name] [industry: type] [pain-point: description] [website-url: URL] [contact: name]`

**Arguments:**
- `[business-name]` — Required. The prospect's business name.
- `[industry: type]` — Optional. Auto-detected from business name if not specified.
- `[pain-point: description]` — Optional. Specific problem we're solving. Auto-generated if not provided.
- `[website-url: URL]` — Optional. The demo website URL we built for them (from `/deploy-site`).
- `[contact: name]` — Optional. Contact person's name for personalization.

**Examples:**
- `/email-campaign "Mike's Plumbing" industry: trades website-url: https://mikes-plumbing.vercel.app`
- `/email-campaign "Bella's Salon" pain-point: "no online booking, losing clients to competitors"`
- `/email-campaign "Hamilton Auto Care" contact: "Dave" website-url: https://hamilton-auto.vercel.app`

## Steps

### 1. Research the Prospect

Before writing anything:
- WebSearch for the business: find their current online presence (website, Google Business, social media, reviews)
- Note: Do they have a website? If yes, how does it look? If no, that's the pitch.
- Find their Google rating and review count
- WebSearch for their top 2-3 competitors in the same area
- Note competitor strengths: better websites, more reviews, higher Google ranking
- Check OUTREACH-PLAYBOOK.md if it exists for campaign context and industry stats

### 2. Identify Pain Points

If no pain point is specified, determine the most likely one:

| Scenario | Pain Point | Angle |
|----------|-----------|-------|
| No website at all | Invisible to 93% of customers who search online | "Your competitors are getting calls that should be yours" |
| Outdated website | Looks unprofessional, slow, not mobile-friendly | "Your current site is costing you customers" |
| No mobile optimization | 60%+ of searches are mobile — bad experience = lost calls | "Try pulling up your site on a phone" |
| No Google Business | Missing from Google Maps, the #1 way locals find businesses | "When someone searches '[service] near me', you don't show up" |
| Low reviews | Competitors have more/better reviews | "Your competitors have [X] reviews vs your [Y]" |
| No online booking | Losing convenience-driven customers | "People want to book at 11pm, not call at 9am" |

### 3. Draft Email Sequence

Generate a 3-email sequence: Initial → Day 3 Follow-up → Day 7 Final.

#### Email 1: The Opening (Day 0)

**Structure:**
1. **Personal hook** (1 sentence): Reference something specific about their business
2. **The problem** (1-2 sentences): Pain point, backed by data
3. **The proof** (1-2 sentences): What their competitors are doing / industry stat
4. **The gift** (1-2 sentences): "We built you a website — take a look"
5. **Soft CTA** (1 sentence): No pressure, just look

**Subject Line Variants (5):**
1. **Curiosity**: "I built something for [Business Name]"
2. **Direct**: "[Business Name] — your new website is ready"
3. **Pain point**: "Why [Competitor] is getting more calls than you"
4. **Question**: "Is [Business Name] showing up when Hamilton searches for [service]?"
5. **Social proof**: "How [industry] businesses in Hamilton are getting 3x more calls"

**Tone rules:**
- Helpful, not salesy. We're giving, not pitching.
- Short paragraphs (1-2 sentences each)
- Total length: 100-150 words. Not a word more.
- No buzzwords. No "leverage" or "synergy" or "solutions."
- First person singular ("I", not "we" or "our team")
- Write like a human who genuinely wants to help

**Template:**

```
Subject: [Selected subject line]

Hi [Contact Name / there],

[Personal hook — reference their Google listing, a review, their location, something REAL]

[Pain point with data — "93% of consumers search online before choosing a local business. Right now, when someone in Hamilton searches for '[service]', [Competitor] shows up — and you don't."]

[The gift — "I liked what you're doing, so I put together a quick website for [Business Name]. No catch — just wanted to show you what's possible."]

[Link — "Take a look: [website-url]"]

[Soft CTA — "If you like it, I'd love to chat about getting it live. If not, no worries at all."]

[Signature]
Noah Reese
Intelligence Masters
Book a time: https://intelligence-masters.neetocal.com
```

#### Email 2: The Follow-up (Day 3)

**Structure:**
1. **Quick reference** to email 1
2. **New angle** — different value prop or pain point
3. **Social proof** — another business we helped (if applicable)
4. **Reinforce the gift** — link again
5. **Lower the bar** — even softer CTA

**Template:**

```
Subject: Re: [Original subject line]

Hi [Contact Name / there],

Just bumping this up — I know [industry] owners are busy.

[New angle — e.g., "I noticed [Competitor] just updated their website. They're clearly investing in getting more Hamilton customers online."]

[Reinforce — "The site I made for you is still live: [website-url]. It's mobile-optimized, shows up your services, and has click-to-call built in."]

[Lower bar — "Even a 15-minute call could save you hours. But zero pressure — happy to just answer questions over email too."]

Noah
```

#### Email 3: The Breakup (Day 7)

**Structure:**
1. **Acknowledge** they're busy / not interested
2. **One final value drop** — a tip or insight they can use regardless
3. **Leave the door open**
4. **Delete pressure** — "I'll take this down if you don't want it"

**Template:**

```
Subject: Should I take down your website?

Hi [Contact Name / there],

I'll keep this short — I built a demo website for [Business Name] last week and wanted to check if you had a chance to see it: [website-url]

[Value drop — "Quick tip regardless: make sure your Google Business hours are updated. I noticed [observation]. That alone can cost you calls."]

If you're not interested, totally fine — I'll take the demo down. But if you want to chat, my calendar's open: https://intelligence-masters.neetocal.com

Either way, wishing you a great week.

Noah
```

### 4. Personalization Requirements

Every email MUST include at least 2 of these personalization elements:
- [ ] Business name (not just in the subject line)
- [ ] Industry-specific language ("your shop" vs "your business")
- [ ] Competitor reference (real competitor name)
- [ ] Specific observation about their online presence (Google rating, review count, website state)
- [ ] City/neighborhood reference ("Hamilton homeowners searching for...")
- [ ] Service-specific language ("drain cleaning" not just "plumbing")

### 5. Industry Stats Bank

Use these in emails for credibility:

| Stat | Source Context |
|------|--------------|
| 93% of consumers search online before visiting a local business | BrightLocal |
| 76% of people who search for something nearby visit within 24 hours | Google |
| 60% of searches happen on mobile devices | StatCounter |
| 88% of consumers trust online reviews as much as personal recommendations | BrightLocal |
| Businesses with websites get 2-3x more leads than those without | Various |
| 70% of small business websites are not mobile-optimized | Google |
| Average attention span on a website: 8 seconds | Microsoft |
| First page of Google captures 95% of search traffic | Chitika |
| 46% of all Google searches are looking for local information | GoGulf |
| A 1-second delay in page load reduces conversions by 7% | Akamai |

### 6. Signature Block

```
--
Noah Reese
Intelligence Masters
Web Design & Digital Marketing
hamilton@intelligencemasters.com
Book a call: https://intelligence-masters.neetocal.com
```

## Output Format

```
## Email Campaign — [Business Name]
**Industry**: [type]
**Pain Point**: [identified pain point]
**Demo URL**: [website-url or "not yet built"]
**Date**: [date]

---

### Research Summary
- **Current online presence**: [website/no website, Google Business status, rating, review count]
- **Top competitors**: [2-3 names with brief notes on their online presence]
- **Key observation**: [something specific we noticed]

### Email 1 — The Opening (Send Day 0)
**Subject lines** (pick one):
1. [subject]
2. [subject]
3. [subject]
4. [subject]
5. [subject]

**Recommended**: #[X]

**Body:**
[Full email text]

---

### Email 2 — The Follow-up (Send Day 3)
**Subject**: Re: [original subject]

**Body:**
[Full email text]

---

### Email 3 — The Breakup (Send Day 7)
**Subject**: [subject]

**Body:**
[Full email text]

---

### Personalization Checklist
- [x/] Business name used: [X] times
- [x/] Competitor referenced: [name]
- [x/] Industry stat used: [stat]
- [x/] Local reference: [detail]
- [x/] Specific observation: [detail]

### Campaign Notes
- **Best send time**: [Tuesday-Thursday, 9-11am local time]
- **If they reply**: [suggested response approach]
- **If they book**: [prep notes for the call]
```

## Rules

- **Never sound like spam.** If it reads like a mass email, rewrite it. Every email should feel like it was written for ONE person.
- **100-150 words per email. MAX.** Business owners don't read essays. They scan. Make every word count.
- **The website is the gift, not the pitch.** We're leading with value — "look what we made for you" — not "buy our service."
- **Real data only.** Don't invent competitor names, review counts, or Google ratings. Use WebSearch to find real ones. If you can't find them, use industry stats instead.
- **Booking link is sacred.** Every email includes `https://intelligence-masters.neetocal.com` — this is the conversion point.
- **No pressure escalation.** Each follow-up should be LESS aggressive, not more. The breakup email is the softest.
- **Test from their perspective.** Read each email as if you're a busy plumber/salon owner who gets 50 emails a day. Would you read past the first line?
- **This completes the pipeline.** `/seo-audit` → `/copy-write` → `/landing-page` → `/website-qa` → `/deploy-site` → `/email-campaign`. This is the last step.
