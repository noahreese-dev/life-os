---
name: design-system
description: Frontend design system generator — complete CSS custom properties for any industry with color, typography, spacing, shadows, animations, and breakpoints
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash(ls*), Bash(date*)
---

# Design System — Frontend Design System Generator

You are generating a complete, production-ready CSS design system for a web project. The output is a block of CSS custom properties and base styles that can be pasted into any HTML file or used as the foundation for a `/build-site` or `/landing-page` build.

## Invocation

`/design-system [industry] [brand-color: #hex] [mode: dark|light|both]`

**Arguments:**
- `[industry]` — Required. One of: restaurant, trades, beauty, pet-care, tech, medical, legal, real-estate, automotive, retail, fitness, photography, education, nonprofit, agency
- `[brand-color: #hex]` — Optional. Primary brand color. If provided, the entire palette is built around it.
- `[mode: ...]` — Optional. Defaults to `dark`. Set `both` to generate light and dark themes.

**Examples:**
- `/design-system restaurant` — Restaurant-appropriate dark theme
- `/design-system trades brand-color: #f59e0b` — Trades theme built around amber
- `/design-system medical mode: both` — Medical theme with light and dark variants

## Steps

### 1. Determine Industry Aesthetics

Each industry has a distinct visual language. Use these as defaults (overridden by brand-color if provided):

| Industry | Primary | Secondary | Accent | Feel |
|----------|---------|-----------|--------|------|
| **restaurant** | `#d4a574` warm gold | `#2d1810` deep brown | `#c0392b` rich red | Warm, inviting, appetite-stimulating |
| **trades** | `#f59e0b` amber | `#1e3a5f` navy | `#ef4444` safety red | Strong, reliable, industrial |
| **beauty** | `#d4a5c4` rose | `#2d1f2d` deep plum | `#c9a96e` gold | Elegant, soft, luxurious |
| **pet-care** | `#4ade80` fresh green | `#1a365d` trust blue | `#fb923c` playful orange | Friendly, warm, trustworthy |
| **tech** | `#6366f1` indigo | `#0f172a` deep slate | `#06b6d4` cyan | Modern, clean, innovative |
| **medical** | `#0ea5e9` sky blue | `#0f2744` clinical navy | `#10b981` health green | Trustworthy, clean, calming |
| **legal** | `#1e3a5f` deep navy | `#1a1a2e` charcoal | `#c9a96e` gold | Authoritative, prestigious, serious |
| **real-estate** | `#1e3a5f` navy | `#f8fafc` clean white | `#c9a96e` gold | Professional, aspirational, trustworthy |
| **automotive** | `#dc2626` racing red | `#18181b` carbon | `#a3a3a3` chrome | Bold, powerful, performance |
| **retail** | `#8b5cf6` purple | `#1e1b2e` deep | `#f472b6` pink | Exciting, trendy, engaging |
| **fitness** | `#22c55e` energy green | `#1a1a1a` dark | `#ef4444` power red | Energetic, motivating, bold |
| **photography** | `#f5f5f5` clean white | `#171717` true black | `#a78bfa` violet | Minimal, artistic, focused |
| **education** | `#3b82f6` blue | `#1e293b` slate | `#f59e0b` warm amber | Trustworthy, approachable, clear |
| **nonprofit** | `#10b981` emerald | `#1e3a5f` navy | `#f59e0b` amber | Warm, trustworthy, mission-driven |
| **agency** | `#8b5cf6` violet | `#0a0a0f` void | `#06b6d4` cyan | Bold, creative, cutting-edge |

### 2. Generate Color Palette

Build a complete palette with these required tokens:

```css
:root {
  /* Core palette */
  --color-primary: ;          /* Main brand color */
  --color-primary-light: ;    /* 15% lighter */
  --color-primary-dark: ;     /* 15% darker */
  --color-secondary: ;        /* Supporting color */
  --color-accent: ;           /* Call-to-action, highlights */
  --color-accent-hover: ;     /* Accent on hover (10% lighter) */

  /* Backgrounds */
  --color-bg: ;               /* Page background */
  --color-bg-alt: ;           /* Alternate sections */
  --color-surface: ;          /* Cards, containers */
  --color-surface-hover: ;    /* Surface on hover */
  --color-surface-raised: ;   /* Elevated cards, modals */

  /* Text */
  --color-text: ;             /* Primary text */
  --color-text-secondary: ;   /* Secondary/muted text */
  --color-text-tertiary: ;    /* Tertiary/disabled text */
  --color-text-inverse: ;     /* Text on accent backgrounds */
  --color-heading: ;          /* Headings (often slightly brighter) */

  /* Borders */
  --color-border: ;           /* Default borders */
  --color-border-light: ;     /* Subtle borders */
  --color-border-focus: ;     /* Focus ring color */

  /* Semantic */
  --color-success: #10b981;
  --color-success-bg: rgba(16, 185, 129, 0.1);
  --color-warning: #f59e0b;
  --color-warning-bg: rgba(245, 158, 11, 0.1);
  --color-error: #ef4444;
  --color-error-bg: rgba(239, 68, 68, 0.1);
  --color-info: #3b82f6;
  --color-info-bg: rgba(59, 130, 246, 0.1);
}
```

**Contrast Requirements (WCAG AA):**
- Normal text on background: minimum 4.5:1
- Large text (18px+ or 14px+ bold) on background: minimum 3:1
- Interactive elements: minimum 3:1 against adjacent colors
- Calculate and comment contrast ratios for key combinations

### 3. Generate Typography Scale

```css
:root {
  /* Font families */
  --font-sans: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif: 'Georgia', 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-heading: var(--font-sans);  /* Override per industry */
  --font-body: var(--font-sans);

  /* Type scale (1.25 ratio — Major Third) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-md: 1.125rem;    /* 18px */
  --text-lg: 1.25rem;     /* 20px */
  --text-xl: 1.5rem;      /* 24px */
  --text-2xl: 1.875rem;   /* 30px */
  --text-3xl: 2.25rem;    /* 36px */
  --text-4xl: 3rem;       /* 48px */
  --text-5xl: 3.75rem;    /* 60px */

  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.2;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 1.75;

  /* Letter spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;

  /* Font weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### 4. Generate Spacing System

```css
:root {
  /* Spacing scale (4px base) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */

  /* Section spacing */
  --section-gap: var(--space-24);         /* Between major sections */
  --section-gap-mobile: var(--space-16);  /* Mobile section spacing */
  --content-gap: var(--space-8);          /* Between content blocks */
  --card-padding: var(--space-6);         /* Card internal padding */
  --container-padding: var(--space-6);    /* Container side padding */

  /* Layout */
  --container-max: 1200px;
  --container-narrow: 800px;
  --container-wide: 1440px;
}
```

### 5. Generate Border, Shadow & Animation Tokens

```css
:root {
  /* Border radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px — subtle rounding */
  --radius-md: 0.5rem;     /* 8px — default cards */
  --radius-lg: 0.75rem;    /* 12px — prominent cards */
  --radius-xl: 1rem;       /* 16px — large cards, modals */
  --radius-2xl: 1.5rem;    /* 24px — pills, floating elements */
  --radius-full: 9999px;   /* Circles, pill buttons */

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(var(--color-primary-rgb), 0.3);  /* Brand glow */
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
  --transition-slower: 500ms ease;

  /* Animation timing */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Breakpoints (for reference — use in media queries) */
  /* --bp-mobile-s: 320px */
  /* --bp-mobile: 375px */
  /* --bp-tablet: 768px */
  /* --bp-laptop: 1024px */
  /* --bp-desktop: 1440px */
  /* --bp-wide: 1920px */

  /* Z-index scale */
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
}
```

### 6. Generate Base Styles

Include a base styles block that applies the design system:

```css
/* === BASE RESET & STYLES === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text);
  background-color: var(--color-bg);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-heading);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

h1 { font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl)); font-weight: var(--font-extrabold); }
h2 { font-size: clamp(var(--text-2xl), 4vw, var(--text-4xl)); font-weight: var(--font-bold); }
h3 { font-size: clamp(var(--text-xl), 3vw, var(--text-2xl)); font-weight: var(--font-semibold); }

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-base);
}
a:hover { color: var(--color-accent); }

img { max-width: 100%; height: auto; display: block; }

/* Container */
.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

/* Section */
.section {
  padding: var(--section-gap) 0;
}

@media (max-width: 768px) {
  .section { padding: var(--section-gap-mobile) 0; }
}

/* Button base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
  min-height: 44px; /* Touch target */
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}
.btn-primary:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* Card base */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--card-padding);
  transition: all var(--transition-base);
}
.card:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-focus);
  box-shadow: var(--shadow-lg);
}

/* Glass effect */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}
```

### 7. Output the Complete System

Combine all tokens and base styles into one CSS block. Add a header comment:

```css
/*
 * Design System: [Industry] Theme
 * Generated by Life-OS /design-system
 * Date: [date]
 * Mode: [dark/light/both]
 * Brand Color: [hex or "industry default"]
 *
 * Usage: Paste this entire block into your <style> tag.
 * All values are CSS custom properties — override any :root variable to customize.
 */
```

## Output Format

Deliver the complete CSS as a single, ready-to-paste code block. Follow with a brief usage guide:

```
## Design System: [Industry] Theme

### Color Palette
[Visual representation using colored text or a table showing each color and its purpose]

### Contrast Verification
| Combination | Ratio | WCAG AA |
|-------------|-------|---------|
| Text on Background | X:1 | PASS/FAIL |
| Heading on Background | X:1 | PASS/FAIL |
| Accent on Background | X:1 | PASS/FAIL |
| Text on Surface | X:1 | PASS/FAIL |

### Usage
[CSS code block with the complete design system]

### Quick Reference
- Sections: Use `.section` + `.container` for consistent spacing
- Cards: Use `.card` or `.glass` for content containers
- Buttons: Use `.btn.btn-primary` for CTAs
- Responsive: Breakpoints at 768px (tablet) and 1024px (laptop)
```

## Rules

- **Complete and self-contained.** The output should work when pasted as-is. No missing variables, no undefined references.
- **Industry-appropriate.** A law firm and a pet groomer should NEVER get the same color palette. The industry parameter exists for a reason.
- **Contrast is non-negotiable.** Every text-on-background combination MUST meet WCAG AA (4.5:1). Check it. Report it.
- **Brand color overrides industry defaults.** If a brand color is provided, derive the entire palette from it using color theory (analogous, complementary, triadic).
- **Dark theme by default.** Light theme is only generated when `mode: light` or `mode: both` is specified.
- **This feeds into `/build-site` and `/landing-page`.** The design system output should be directly pasteable into those builds.
- **No external dependencies.** System fonts only. No Google Fonts, no CDN.
