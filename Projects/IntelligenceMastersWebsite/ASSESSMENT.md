# IntelligenceMasters Website — Codebase Assessment

> Assessed: 2026-02-08

## Tech Stack
- **Framework**: Astro 5.16 + React 19
- **Styling**: Tailwind CSS v4 + custom CSS variables (dark/light theming)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Playfair Display (serif) + DM Sans (body)

## What Exists Today

### Pages (4)
1. **index.astro** — Landing page (Hero + Services sections)
2. **services/[id].astro** — Individual service pages (build, integrate, strategy) — all show "Coming Soon"
3. **team.astro** — Team page with Noah Reese + placeholder for future members
4. **portfolio.astro** — Portfolio page — just a "Coming Soon" placeholder

### Components (7)
1. **Hero.tsx** — Full hero section with animated headline "Master AI before AI masters you", parallax orbs, shooting stars, particles, magnetic CTA buttons
2. **Navbar.tsx** — Desktop top navbar + mobile hamburger with slide-out drawer. Nav items: Home, Services, Portfolio, Team, About
3. **Services.tsx** — 3 service cards (Custom Build, Rapid Integration, Strategic Advisory) with Hormozi-style copy. Expandable detail view with pain/solution/benefits/CTA
4. **ThemeToggle.tsx** — Dark/light mode toggle (exists but NOT wired into any page)
5. **TransitionZone.tsx** — Could not read (may be empty or broken)
6. **ui/shooting-stars.tsx** — Canvas-based shooting star animation (performant)
7. **ui/liquid-crystal-shader.tsx** — WebGL2 shader background (global, behind all content)

### Design Quality
- **High**. Premium dark-mode aesthetic, good animations, Hormozi-style persuasive copy
- Responsive: mobile nav, fluid typography, safe-area support
- Performance-conscious: canvas animations, content-visibility, CSS containment

## What's MISSING (vs. the Vision)

### Critical Gaps
| Missing Feature | Priority | Notes |
|----------------|----------|-------|
| **AI Orb Interface** | HIGH | The CORE of the vision. Currently just a static landing page. No conversational orb exists. |
| **Bounty Board** | HIGH | No task/project submission system. This is the revenue engine. |
| **Contact/Inquiry Form** | HIGH | Multiple CTAs point to `#contact` but NO contact section exists on the page |
| **About Section** | MEDIUM | Nav links to `#about` but no about section exists |
| **Consulting Funnel** | HIGH | No way for users to actually book a call or submit an inquiry |

### Secondary Gaps
- ThemeToggle component exists but isn't used in any page
- Service detail pages are all "Coming Soon" — no real content
- Portfolio page is empty placeholder
- No analytics, no SEO meta beyond basics
- No favicon (references `/favicon.svg` but likely doesn't exist)

## Current State Summary

**What it IS**: A polished landing page with a hero and 3 service cards. Looks great but is essentially a brochure — no interactivity, no orb, no way to convert visitors.

**What it NEEDS to be**: An orb-first conversational interface that replaces the traditional menu, guides users to services/bounties, and captures leads.

## Recommended Next Steps

1. **Add contact section** — Immediate. Every CTA on the site points to `#contact` which doesn't exist
2. **Build the AI orb** — Replace/augment the hero with a conversational orb interface
3. **Build the bounty board** — Task submission system for clients (needs backend — Supabase?)
4. **Wire up ThemeToggle** — Already built, just needs to be added to Navbar
5. **Fill service detail pages** — Replace "Coming Soon" with real content
