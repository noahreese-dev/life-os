---
name: build-site
description: Stunning single-file HTML website builder — zero dependencies, modern CSS, dark theme, fully offline-capable
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Bash(ls*), Bash(date*), WebSearch, WebFetch
---

# Build Site — Stunning HTML Website Builder

You are building a beautiful, production-quality single-file HTML website. The CEO uses this frequently for quick sites (Ali flu cure site, Agent BTD landing page, client demos, etc.) and expects visual excellence with zero setup friction.

## Invocation

`/build-site [topic] [for: recipient] [style: medical|portfolio|dashboard|landing|report]`

**Arguments:**
- `[topic]` — Required. What the site is about (e.g., "flu remedies", "project showcase", "Agent BTD")
- `[for: recipient]` — Optional. Who this is for. Affects tone and branding (e.g., "for: Boz", "for: client demo")
- `[style: ...]` — Optional. Visual style preset. Defaults to `landing` if not specified.

**Style presets:**
| Style | Description |
|-------|-------------|
| `medical` | Clean, trustworthy, soft blues/greens, clear info hierarchy, citation-friendly |
| `portfolio` | Bold, creative, hero sections, project cards, timeline layouts |
| `dashboard` | Data-dense, card grids, stat counters, dark with accent colors |
| `landing` | Hero + features + CTA, gradient backgrounds, testimonials, conversion-focused |
| `report` | Document-like, structured sections, tables, print-optimized, professional |

## Steps

### 1. Understand the Request
- Parse the topic, recipient, and style from the invocation
- If topic is vague, make a reasonable assumption and build — don't ask 5 clarifying questions
- If the CEO gave you content (research docs, notes, bullet points), use that as the content source
- If no content is provided, generate intelligent placeholder content that demonstrates the structure

### 2. Build the HTML File

Create a single `.html` file. Everything — CSS, JavaScript, content — goes in ONE file. Zero external dependencies. Zero CDN links. Zero npm. The file must work when double-clicked from a file explorer.

**File location:** Place the file in the current working directory unless the CEO specifies otherwise. Name it based on the topic (e.g., `flu-remedies.html`, `agent-btd-showcase.html`).

### 3. Visual Design System

Every site you build MUST include these CSS elements:

#### Color & Theme
- Dark theme by default (`background: #0a0a0f` or similar deep dark)
- Rich color palette with 3-4 accent colors (use HSL for easy theming)
- CSS custom properties for all colors at `:root` level
- Proper contrast ratios (WCAG AA minimum: 4.5:1 for text)

#### Layout
- CSS Grid for page-level layout
- Flexbox for component-level alignment
- Mobile-first responsive design (start at 320px, scale up)
- Breakpoints: 320px, 768px, 1024px, 1440px
- Max content width of 1200px centered
- Generous whitespace — breathing room between sections

#### Typography
- Clean system font stack: `'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Proper hierarchy: h1 (2.5-3rem), h2 (2rem), h3 (1.5rem), body (1rem/1.125rem)
- Line-height: 1.6 for body text, 1.2 for headings
- Letter-spacing adjustments for headings (-0.02em)
- `font-smoothing: antialiased` for crisp rendering

#### Animations & Effects
- Animated gradient background (subtle, slow-moving mesh gradient using `@keyframes`)
- Scroll-reveal animations using IntersectionObserver (fade-in, slide-up)
- Smooth scroll behavior (`scroll-behavior: smooth`)
- Hover effects on all interactive elements (scale, glow, color shift)
- CSS transitions on everything interactive (`transition: all 0.3s ease`)
- Loading animation on page load (fade-in the body)
- Respect `prefers-reduced-motion` — disable animations if user prefers

#### Glassmorphism & Depth
- Glass-effect cards: `backdrop-filter: blur(20px)`, semi-transparent backgrounds
- Layered shadows for depth (`box-shadow` with multiple layers)
- Border with subtle gradient or semi-transparent white

#### Custom Scrollbar
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
::-webkit-scrollbar-thumb { background: linear-gradient(var(--accent), var(--accent-secondary)); border-radius: 4px; }
```

#### Responsive
- Navigation collapses to hamburger on mobile (CSS-only using checkbox hack, no JS library)
- Images and cards reflow into single column on mobile
- Font sizes scale with `clamp()` for fluid typography
- Touch-friendly tap targets (min 44px)

### 4. Required HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Topic] — [Subtitle]</title>
    <meta name="description" content="[Compelling description]">

    <!-- Social Meta Tags -->
    <meta property="og:title" content="[Title]">
    <meta property="og:description" content="[Description]">
    <meta property="og:type" content="website">
    <meta property="og:image" content="[URL if available]">
    <meta name="twitter:card" content="summary_large_image">

    <!-- Favicon as inline SVG data URI -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>[EMOJI]</text></svg>">

    <style>
        /* All CSS here — no external stylesheets */
    </style>
</head>
<body>
    <!-- Semantic HTML5 structure -->
    <header><!-- Nav --></header>
    <main>
        <section id="hero"><!-- Hero section --></section>
        <section id="features"><!-- Content sections --></section>
        <!-- More sections as needed -->
    </main>
    <footer><!-- Branding + links --></footer>

    <script>
        /* All JS here — no external scripts */
        /* IntersectionObserver for scroll reveal */
        /* Smooth scroll */
        /* Any interactive behavior */
    </script>
</body>
</html>
```

### 5. JavaScript (Minimal, Purposeful)

Only include JS for:
- **Scroll-reveal animations** — IntersectionObserver to add `.visible` class
- **Smooth scroll** — anchor link interception
- **Mobile nav toggle** — if CSS-only hamburger isn't sufficient
- **Dynamic counters** — animated number counting for stats/dashboards
- **Copy-to-clipboard** — if the page has code snippets or shareable content
- **Theme toggle** — optional light/dark switch (store in localStorage)

No frameworks. No libraries. Vanilla JS only.

### 6. Print Styles

Include a `@media print` block:
- Remove animations, backgrounds, shadows
- Set text to black on white
- Show URLs after links (`a[href]:after { content: " (" attr(href) ")"; }`)
- Hide navigation and non-essential decorative elements
- Page-break-inside: avoid on cards and sections

## Best Practices Checklist

Before delivering the site, verify EVERY item:

- [ ] Single file, zero dependencies — no CDN links, no external CSS/JS/fonts
- [ ] Works offline when double-clicked from file explorer
- [ ] Mobile responsive — tested mentally at 320px, 768px, 1024px, 1440px
- [ ] Dark theme with proper contrast ratios (WCAG AA: 4.5:1 minimum)
- [ ] Smooth animations with `prefers-reduced-motion` respected
- [ ] Semantic HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`, `<article>`)
- [ ] Custom scrollbar styled
- [ ] Social meta tags (og:title, og:description, og:type)
- [ ] Inline SVG favicon
- [ ] Footer with branding or attribution
- [ ] Print-friendly styles via `@media print`
- [ ] CSS custom properties for easy theming
- [ ] No horizontal scroll at any viewport width
- [ ] All interactive elements have hover/focus states
- [ ] Anchor links use smooth scroll

## Style-Specific Guidelines

### Medical
- Color palette: deep navy (#0a192f), soft teal (#38bdf8), warm white (#f8fafc)
- Clean card layouts for remedies/instructions
- Step-by-step numbered sections
- Warning/caution callout boxes with amber borders
- Citations section at bottom

### Portfolio
- Full-viewport hero with animated gradient
- Project cards with image placeholders (CSS gradient backgrounds)
- Skills/tech as pill badges
- Timeline for experience
- Contact CTA at bottom

### Dashboard
- Stat cards with large numbers and sparkline-style accents
- Grid layout (2-3 columns on desktop)
- Progress bars with gradient fills
- Status indicators (green/amber/red dots)
- Compact information density

### Landing
- Hero with headline + subhead + CTA button
- Feature grid (3-column with icons)
- Social proof / testimonials section
- Pricing or comparison table
- Final CTA section before footer

### Report
- Table of contents with anchor links
- Numbered sections with clear hierarchy
- Data tables with alternating row colors
- Blockquote styling for key findings
- Executive summary at top
- Optimized for printing

## Rules

- **Ship it.** Don't ask 10 questions — build the site and iterate. The CEO can always say "change the colors" or "add a section."
- **Visual excellence is non-negotiable.** Every site should look like it cost $5K. No boring defaults.
- **Single file is sacred.** The moment you add an external dependency, you've broken the contract.
- **Dark theme first.** Light theme is optional. Dark theme is mandatory.
- **Animations must be smooth.** Use `transform` and `opacity` only for animations (GPU-accelerated). Never animate `width`, `height`, `top`, `left`.
- **Content is king.** Beautiful design with garbage placeholder text is worse than plain HTML with real content. Use the CEO's actual content when provided.
