---
name: landing-page
description: High-converting landing page builder — proven structure, A/B testable headlines, conversion-optimized layout for service businesses, restaurants, portfolios, SaaS, and local businesses
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(ls*), Bash(date*), WebSearch, WebFetch
---

# Landing Page — High-Converting Landing Page Builder

You are building a conversion-optimized landing page. This is NOT just a pretty website — it is a machine designed to turn visitors into leads, calls, or customers. Every element serves a conversion purpose.

## Invocation

`/landing-page [business] [industry: type] [template: service|restaurant|portfolio|saas|local] [cta: phone|form|booking|buy]`

**Arguments:**
- `[business]` — Required. Business name or description.
- `[industry: type]` — Optional. Industry for design system selection. Auto-detected from business if not specified.
- `[template: ...]` — Optional. Page structure template. Defaults to `service`.
- `[cta: ...]` — Optional. Primary conversion action. Defaults to `phone` for local businesses, `form` for others.

**Examples:**
- `/landing-page "Mike's Plumbing" industry: trades cta: phone` — Local plumber, phone calls are the goal
- `/landing-page "Bella's Salon" template: local` — Local beauty business
- `/landing-page "TechStart" template: saas cta: form` — SaaS signup page

## Steps

### 1. Research & Strategy

Before building anything:
- Determine the primary conversion goal (phone call, form submission, booking, purchase)
- Identify the target audience and their pain points
- Define the unique value proposition (UVP) — what makes this business different?
- If business info is provided, use it. If not, generate realistic placeholder content that demonstrates the structure.
- Run `/design-system [industry]` mentally to establish the visual foundation.

### 2. Page Structure (Conversion-Proven Order)

Every landing page follows this structure. Each section has a specific conversion job:

#### Section 1: Hero (Above the Fold)
**Job: Hook attention in 3 seconds + get first click**
- **Headline**: Clear benefit statement, not a feature. 6-12 words max.
  - Generate 5 A/B testable variants (comment the alternates in HTML)
  - Use power words: "guaranteed", "free", "instant", "proven", "trusted"
- **Subheadline**: Expand on the headline. Address the pain point. 15-25 words.
- **Primary CTA button**: High contrast, action-oriented text ("Get Free Quote", not "Submit")
- **Secondary CTA**: Less prominent ("Call Now: (555) 123-4567")
- **Trust indicator**: "Trusted by 500+ homeowners" or "4.9 stars on Google"
- **Hero image area**: CSS gradient or pattern background (no external images needed)

```html
<!-- A/B Test Headlines:
  v1: "Hamilton's Most Trusted Plumber — Guaranteed Same-Day Service"
  v2: "Plumbing Emergency? We're There in 60 Minutes or It's Free"
  v3: "Stop Searching — Hamilton's #1 Rated Plumber is One Call Away"
  v4: "Your Pipes Fixed Right, or You Don't Pay. Period."
  v5: "24/7 Emergency Plumbing — Hamilton Homeowners Trust Us Most"
-->
```

#### Section 2: Social Proof Bar
**Job: Immediate credibility before they scroll further**
- Logo strip of partners/clients (CSS placeholder boxes if no logos)
- Key stats: "15+ Years Experience | 2,000+ Jobs Completed | 4.9 Google Rating"
- Certifications or awards

#### Section 3: Problem Statement
**Job: Make them feel understood**
- Address the visitor's pain point directly
- Use "you" language, not "we" language
- Paint the frustration picture: "Tired of plumbers who show up late and overcharge?"
- 3-4 bullet points of common frustrations

#### Section 4: Solution
**Job: Position the business as THE answer**
- How the business solves each pain point from Section 3
- Benefit-focused, not feature-focused
- "We show up on time, quote before we start, and guarantee our work"

#### Section 5: Features/Services Grid
**Job: Show the breadth of what they offer**
- 3-6 service cards in a responsive grid
- Each card: icon (CSS/emoji), title, 1-2 sentence description, optional "Learn More" link
- Most popular or profitable service highlighted

#### Section 6: How It Works
**Job: Reduce friction — show how easy it is**
- 3-step process: "1. Call Us → 2. We Diagnose → 3. Problem Solved"
- Numbered steps with icons
- Emphasize simplicity and speed

#### Section 7: Testimonials
**Job: Let customers sell for you**
- 3 testimonials with: name, location (city only), star rating, quote
- Use real testimonials if provided, realistic placeholders if not
- Include a "Read More Reviews" link to Google/Yelp

#### Section 8: FAQ
**Job: Handle objections before they leave**
- 5-7 common questions
- Collapsible accordion (CSS-only or minimal JS)
- Include questions about: pricing, timeline, guarantees, service area, emergency
- Each answer should subtly reinforce the value proposition
- Structured data (FAQ schema) for rich snippets in Google

#### Section 9: Final CTA
**Job: Last chance to convert — don't let them leave empty-handed**
- Repeat the primary CTA with urgency
- Add a phone number (click-to-call on mobile)
- Include a simple contact form (name, phone, message)
- Add trust elements: "No spam. No obligation. Free quote in 24 hours."
- Consider a limited-time offer or guarantee reminder

#### Section 10: Footer
**Job: Legitimacy + SEO**
- Business name, address, phone (NAP for local SEO)
- Hours of operation
- Service areas
- Links to privacy policy / terms (placeholder)
- Social media links
- Copyright with current year (dynamic JS)

### 3. Conversion Best Practices (Non-Negotiable)

Apply ALL of these:

| Practice | Implementation |
|----------|---------------|
| **Above-fold CTA** | Primary CTA visible without scrolling on all devices |
| **Contrast buttons** | CTA buttons use `--color-accent` — the highest-contrast color on the page |
| **Directional cues** | Arrows, chevrons, or visual flow pointing toward CTAs |
| **White space** | Generous padding between sections — breathing room converts |
| **F-pattern layout** | Key info follows natural eye scanning pattern (top-left to right, then down) |
| **Phone click-to-call** | All phone numbers wrapped in `<a href="tel:+1XXXXXXXXXX">` |
| **Sticky CTA** | Mobile: sticky bottom bar with phone + CTA button |
| **Form simplicity** | Max 3-4 fields. Name + Phone + Message. No required email. |
| **Loading speed** | Single file, no external resources, minimal JS |
| **Trust badges** | Licensed, insured, guaranteed, BBB, Google rating |
| **Urgency elements** | "Limited availability" or "Book today, service tomorrow" (honest urgency only) |
| **Social proof numbers** | Specific numbers ("2,347 jobs completed") beat vague claims ("many customers") |

### 4. Form Handling

Include a contact form with:
- Client-side validation (HTML5 + minimal JS)
- Required fields marked clearly
- Success state (thank you message, hide form)
- The form won't actually submit (no backend) — include a comment explaining how to connect it to Formspree, Netlify Forms, or a backend

```html
<!-- FORM INTEGRATION:
  Option 1 (Formspree): Change action to "https://formspree.io/f/YOUR_ID"
  Option 2 (Netlify): Add netlify attribute to <form>
  Option 3 (Custom): Send form data via fetch() to your API endpoint
-->
```

### 5. SEO & Technical

Every landing page includes:
- Semantic HTML5 structure
- Title tag with primary keyword + business name
- Meta description with CTA
- Open Graph tags for social sharing
- FAQ structured data (JSON-LD)
- LocalBusiness structured data (JSON-LD) if local business
- Canonical tag
- Mobile viewport meta
- Inline SVG favicon

### 6. Template Variations

#### Service Business (default)
Full structure as described above. Best for: plumbers, electricians, cleaners, landscapers, contractors.

#### Restaurant
Replace services grid with menu highlights. Add online ordering CTA. Include hours prominently in hero. Gallery section with CSS gradient food placeholders. Reservation form instead of contact form.

#### Portfolio
Hero becomes a personal statement. Services become project showcases. Testimonials become client logos/quotes. Add a skills/tech section. CTA becomes "Start a Project" or "Get in Touch."

#### SaaS
Hero includes product screenshot area (CSS mockup). Features section becomes a detailed feature comparison. Add pricing tier cards. CTA becomes "Start Free Trial" or "Get Started." Include integration logos section.

#### Local Business
Same as service but with extra emphasis on: Google Maps embed, service area list, hours of operation, "Near Me" keyword optimization, community involvement section.

## Output

A single, complete HTML file following `/build-site` quality standards:
- Single file, zero dependencies
- Dark theme with industry-appropriate design system
- Fully responsive (320px to 1920px)
- All animations respect `prefers-reduced-motion`
- Print styles included
- Ready to deploy

## Rules

- **Conversion over beauty.** A gorgeous page that doesn't convert is a failure. An ugly page that generates calls is a success. Aim for BOTH, but never sacrifice conversion for aesthetics.
- **Real copy over lorem ipsum.** Generate realistic, industry-specific copy. The CEO should be able to send this to a client as-is.
- **Phone numbers are sacred.** On mobile, every phone number MUST be click-to-call. Test this mentally.
- **The fold matters.** 80% of visitors never scroll past the hero. The hero must do the heavy lifting.
- **Forms must be simple.** Every additional field reduces conversions by ~10%. Name + Phone + Message. That's it.
- **Speed is a feature.** Single file = instant load. This is a competitive advantage over WordPress sites that take 4 seconds.
- **A/B headline variants are mandatory.** Always generate 5 headline options as HTML comments. The CEO or client can test them.
- **This feeds into `/deploy-site` and `/email-campaign`.** The page should be deploy-ready and the URL shareable in outreach emails.
