---
name: copy-write
description: Marketing copywriting engine — generates headlines, taglines, service descriptions, CTAs, meta descriptions, and alt text using PAS, AIDA, and BAB frameworks with local SEO integration
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash(ls*), Bash(date*), WebSearch, WebFetch
---

# Copy Write — Marketing Copywriting Engine

You are generating marketing copy for websites. This is not generic filler text — it is strategic, conversion-oriented copy that sounds human, builds trust, and drives action. Every word earns its place.

## Invocation

`/copy-write [business] [industry: type] [city: location] [tone: professional|friendly|bold|luxury|community] [framework: PAS|AIDA|BAB|all]`

**Arguments:**
- `[business]` — Required. Business name and brief description of what they do.
- `[industry: type]` — Optional. Auto-detected from business description if not specified.
- `[city: location]` — Optional but recommended. City for local SEO keyword integration.
- `[tone: ...]` — Optional. Writing tone. Defaults to `professional`.
- `[framework: ...]` — Optional. Copywriting framework to use. Defaults to `all` (generates copy using all three).

**Examples:**
- `/copy-write "Mike's Plumbing — residential plumbing" city: Hamilton tone: friendly`
- `/copy-write "Bella's Salon — hair and nail services" city: Hamilton tone: luxury`
- `/copy-write "TechStart — SaaS project management" tone: bold framework: PAS`

## Steps

### 1. Research & Understand

Before writing a single word:
- Understand the business: what they do, who they serve, what makes them different
- Identify the target audience: demographics, pain points, desires, language they use
- If a city is provided, note local landmarks, neighborhoods, and community identity for authentic local copy
- If a URL exists, WebFetch to understand their current messaging
- WebSearch for competitor messaging in the same industry + city to differentiate

### 2. Define Messaging Framework

Use the appropriate framework(s):

#### PAS (Problem → Agitate → Solve)
Best for: service businesses, trades, medical, legal
1. **Problem**: State the customer's pain point clearly
2. **Agitate**: Make them feel the frustration — what happens if they don't fix this?
3. **Solve**: Present the business as the solution with a clear CTA

#### AIDA (Attention → Interest → Desire → Action)
Best for: retail, SaaS, beauty, fitness
1. **Attention**: Hook with a bold headline or surprising stat
2. **Interest**: Present features and benefits that matter
3. **Desire**: Paint the picture of life AFTER they buy/sign up
4. **Action**: Clear, urgent CTA

#### BAB (Before → After → Bridge)
Best for: coaching, consulting, real-estate, nonprofits
1. **Before**: Current painful state
2. **After**: Dream state after the transformation
3. **Bridge**: How the business makes the transformation happen

### 3. Generate Copy Assets

Produce ALL of the following:

#### Headlines (5 variants)
Generate 5 headline options, each using a different approach:
1. **Benefit-led**: Focus on the outcome ("Get Your Weekends Back")
2. **Pain-point**: Address the frustration ("Tired of Unreliable Contractors?")
3. **Social proof**: Leverage trust ("Hamilton's #1 Rated Plumber")
4. **Urgency**: Create time pressure ("Emergency Plumbing — We're There in 60 Minutes")
5. **Question**: Engage with a question ("Is Your Plumber Costing You More Than They Should?")

Rules for headlines:
- 6-12 words maximum
- Include the primary keyword naturally (e.g., "plumber Hamilton")
- Use power words: guaranteed, free, proven, trusted, instant, exclusive
- Avoid jargon — write at a grade 8 reading level

#### Taglines (3 variants)
Short, memorable brand phrases:
1. Benefit-focused (e.g., "Your Home. Our Priority.")
2. Differentiator-focused (e.g., "Same-Day Service. Every Time.")
3. Trust-focused (e.g., "Licensed. Insured. Guaranteed.")

#### Service Descriptions
For each major service the business offers:
- **Title**: Service name with keyword
- **Description**: 2-3 sentences. Benefit-first, then what's included.
- **CTA line**: Action-oriented closer ("Book your appointment today")

Format:
```
### [Service Name]
[2-3 sentence description focusing on customer benefit, not technical process]
**[CTA line]**
```

#### About Section
Two versions:
1. **Story-based**: Origin story approach — how the business started, what drives them, why they care
2. **Authority-based**: Credentials, experience, numbers — why they're the best choice

Each should be 100-150 words. Include local references if city is provided.

#### CTAs (Call-to-Action Variants)
Generate CTAs for different contexts:
- **Primary button**: "Get Your Free Quote" / "Book Now" / "Call Us Today"
- **Secondary button**: "Learn More" / "See Our Work" / "View Pricing"
- **Phone CTA**: "Call (555) 123-4567 — Available 24/7"
- **Form CTA**: "Send us a message. We respond within 2 hours."
- **Urgency CTA**: "Book today — limited availability this week"
- **Low-commitment CTA**: "Just have a question? Text us anytime."

#### Meta Descriptions (3 variants)
For SEO — these appear in Google search results:
- 150-160 characters each
- Include primary keyword + city
- Include a CTA or value proposition
- End with action: "Call today" / "Get a free quote" / "Book online"

#### Alt Text for Images
Generate descriptive alt text for common website images:
- Hero image
- Team/owner photo
- Service photos (3-4)
- Before/after photos (if applicable)
- Testimonial author photos
- Logo

Format: `alt="[Descriptive text with keyword] — [Business Name] in [City]"`

### 4. Local SEO Integration

If a city is provided, weave local keywords naturally into ALL copy:
- Primary: "[service] [city]" (e.g., "plumber Hamilton")
- Secondary: "[service] near me", "[service] in [city] Ontario"
- Tertiary: "[neighborhood] [service]", "[city] [service] reviews"
- Local references: mention neighborhoods, landmarks, community events where natural
- Service area mentions: "Serving Hamilton, Burlington, Stoney Creek, and surrounding areas"

**Keyword placement rules:**
- H1: Primary keyword once
- H2s: Secondary keywords (one per H2, vary them)
- Body text: 1-2% keyword density, NEVER stuffed
- Meta description: Primary keyword once
- Image alt text: Keywords where naturally descriptive

### 5. Tone Calibration

#### Professional
- Third person or first person plural ("we")
- Formal but approachable
- Data-driven claims with specifics
- Best for: legal, medical, financial, B2B

#### Friendly
- Second person ("you"), conversational
- Contractions, shorter sentences
- Warm, approachable, human
- Best for: trades, pet care, restaurants, local businesses

#### Bold
- Short, punchy sentences. Fragments OK.
- Strong verbs, confident claims
- Challenge the status quo
- Best for: tech, fitness, automotive, agencies

#### Luxury
- Elegant, refined language
- Sensory descriptions
- Exclusivity signals ("curated", "bespoke", "elevated")
- Best for: beauty, real estate, fine dining, boutique retail

#### Community
- Mission-driven language
- "Together" and "our community" phrasing
- Impact stories over features
- Best for: nonprofits, community businesses, co-ops

## Output Format

```
## Website Copy Package — [Business Name]
**Industry**: [type]
**City**: [location]
**Tone**: [selected tone]
**Date**: [date]

---

### Headlines
1. [Benefit-led headline]
2. [Pain-point headline]
3. [Social proof headline]
4. [Urgency headline]
5. [Question headline]

**Recommended**: #[X] — because [reason]

### Taglines
1. [tagline]
2. [tagline]
3. [tagline]

### Hero Section
**Headline**: [recommended headline]
**Subheadline**: [15-25 word supporting line]
**CTA**: [primary button text]
**Trust line**: [social proof one-liner]

### Services
[Service description blocks]

### About
**Version A (Story)**:
[100-150 words]

**Version B (Authority)**:
[100-150 words]

### Testimonial Prompts
[3 example testimonials — realistic, specific, with names and locations]

### FAQ Content
[5-7 Q&A pairs targeting long-tail keywords]

### CTAs
[All CTA variants listed]

### Meta Descriptions
1. [150-160 chars]
2. [150-160 chars]
3. [150-160 chars]

### Image Alt Text
[Alt text for each standard image type]

### Local SEO Keywords
**Primary**: [list]
**Secondary**: [list]
**Long-tail**: [list]
```

## Rules

- **Sound human.** If the copy could be any business in any city, it failed. Every piece should feel specific to THIS business in THIS city.
- **Benefits over features.** "24/7 emergency service" is a feature. "Never worry about a burst pipe at 2am" is a benefit. Always lead with benefits.
- **Kill the jargon.** Write at a grade 8 reading level. The customer doesn't know industry terms and doesn't care.
- **Specific numbers beat vague claims.** "15 years experience" beats "many years." "2,347 jobs completed" beats "thousands served."
- **Every CTA needs a reason.** Don't just say "Call Now." Say "Call Now — Free Estimates, No Obligation."
- **Local SEO is woven in, not bolted on.** Keywords should read naturally. If you have to force it, rewrite the sentence.
- **This feeds into `/landing-page`, `/build-site`, and `/local-seo`.** The copy package should slot directly into any page structure.
- **Never deliver placeholder copy.** Even without real business details, generate realistic, industry-appropriate copy that demonstrates the quality level.
