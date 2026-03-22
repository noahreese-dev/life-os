---
name: color-palette
description: Industry color palette generator — beautiful, accessible color palettes with WCAG AA contrast verification, CSS custom properties output, and 15+ industry presets
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash(ls*), Bash(date*)
---

# Color Palette — Industry Color Palette Generator

You are generating a beautiful, accessible color palette for a web project. Every color is purposeful, every combination is contrast-checked, and the output is ready to paste as CSS custom properties.

## Invocation

`/color-palette [industry] [brand-color: #hex] [mode: dark|light|both] [mood: modern|classic|playful|minimal|warm|cool]`

**Arguments:**
- `[industry]` — Required. One of 15+ industry presets (see list below).
- `[brand-color: #hex]` — Optional. If provided, the entire palette is derived from this color.
- `[mode: ...]` — Optional. Defaults to `dark`.
- `[mood: ...]` — Optional. Fine-tune the palette feel. Defaults to industry-appropriate mood.

**Examples:**
- `/color-palette restaurant` — Restaurant palette, dark mode, warm mood
- `/color-palette trades brand-color: #f59e0b` — Trades palette built around amber
- `/color-palette medical mode: both mood: modern` — Medical palette, both themes, modern feel
- `/color-palette beauty brand-color: #d4a5c4 mood: minimal` — Beauty palette from rose

## Steps

### 1. Industry Preset Selection

Each industry has a researched, psychologically-appropriate color foundation:

| Industry | Primary | Secondary | Accent | Psychology |
|----------|---------|-----------|--------|-----------|
| **restaurant** | `#d4a574` warm gold | `#2d1810` espresso | `#c0392b` rich red | Appetite, warmth, comfort |
| **trades** | `#f59e0b` amber/gold | `#1e3a5f` navy | `#ef4444` safety red | Reliability, strength, trust |
| **beauty** | `#d4a5c4` dusty rose | `#2d1f2d` deep plum | `#c9a96e` champagne gold | Elegance, luxury, femininity |
| **pet-care** | `#4ade80` fresh green | `#1a365d` trust blue | `#fb923c` playful orange | Friendliness, nature, warmth |
| **tech** | `#6366f1` indigo | `#0f172a` dark slate | `#06b6d4` cyan | Innovation, precision, trust |
| **medical** | `#0ea5e9` sky blue | `#0f2744` clinical navy | `#10b981` health green | Trust, cleanliness, calm |
| **legal** | `#1e3a5f` deep navy | `#1a1a2e` charcoal | `#c9a96e` gold | Authority, prestige, tradition |
| **real-estate** | `#1e3a5f` navy | `#0f172a` dark | `#c9a96e` gold | Aspirational, trustworthy, premium |
| **automotive** | `#dc2626` racing red | `#18181b` carbon black | `#a3a3a3` chrome silver | Power, performance, precision |
| **retail** | `#8b5cf6` purple | `#1e1b2e` deep | `#f472b6` hot pink | Excitement, impulse, trend |
| **fitness** | `#22c55e` energy green | `#1a1a1a` dark | `#ef4444` power red | Energy, motivation, vitality |
| **photography** | `#f5f5f5` clean white | `#171717` true black | `#a78bfa` violet | Minimal, artistic, focus |
| **education** | `#3b82f6` trust blue | `#1e293b` slate | `#f59e0b` warm amber | Learning, trust, approachability |
| **nonprofit** | `#10b981` emerald | `#1e3a5f` navy | `#f59e0b` warm amber | Hope, trust, mission |
| **agency** | `#8b5cf6` violet | `#0a0a0f` void | `#06b6d4` electric cyan | Bold, creative, cutting-edge |
| **cafe** | `#b8860b` dark goldenrod | `#2c1810` coffee brown | `#d2691e` chocolate | Warmth, artisan, comfort |
| **cleaning** | `#06b6d4` clean cyan | `#f0f9ff` ice white | `#10b981` fresh green | Cleanliness, freshness, trust |
| **dental** | `#60a5fa` light blue | `#0c4a6e` ocean navy | `#f9fafb` bright white | Hygiene, calm, professionalism |
| **landscaping** | `#16a34a` forest green | `#422006` earth brown | `#facc15` sun yellow | Nature, growth, reliability |
| **construction** | `#ea580c` construction orange | `#292524` charcoal | `#fbbf24` caution yellow | Strength, safety, industrial |

### 2. Brand Color Derivation

If a brand color is provided, derive the full palette using color theory:

1. **Analyze the brand color**: Convert to HSL. Note hue, saturation, lightness.
2. **Generate harmonies**:
   - **Complementary**: Hue + 180 degrees (for accent/CTA)
   - **Analogous**: Hue +/- 30 degrees (for secondary colors)
   - **Triadic**: Hue +/- 120 degrees (for variety)
   - **Split-complementary**: Hue +/- 150 degrees (softer contrast)
3. **Choose the best harmony** based on the industry and mood.
4. **Derive the full palette** from the harmony.

### 3. Generate Complete Palette

Every palette must include ALL of these colors:

```css
:root {
  /* === BRAND COLORS === */
  --color-primary: ;           /* Main brand identity color */
  --color-primary-rgb: ;       /* RGB values for rgba() usage */
  --color-primary-light: ;     /* Lighter variant (+15% lightness) */
  --color-primary-dark: ;      /* Darker variant (-15% lightness) */
  --color-primary-subtle: ;    /* Very light tint for backgrounds */

  --color-secondary: ;         /* Supporting brand color */
  --color-secondary-light: ;
  --color-secondary-dark: ;

  --color-accent: ;            /* CTA buttons, highlights, links */
  --color-accent-hover: ;      /* Accent on hover (+10% lightness) */
  --color-accent-active: ;     /* Accent when clicked (-5% lightness) */
  --color-accent-rgb: ;        /* RGB for rgba() usage */

  /* === BACKGROUNDS === */
  --color-bg: ;                /* Main page background */
  --color-bg-alt: ;            /* Alternating section background */
  --color-bg-elevated: ;       /* Slightly lighter than bg (for depth) */

  --color-surface: ;           /* Card/container background */
  --color-surface-hover: ;     /* Surface on hover */
  --color-surface-raised: ;    /* Modals, dropdowns, popovers */
  --color-surface-overlay: ;   /* Semi-transparent overlay (rgba) */

  /* === TEXT === */
  --color-text: ;              /* Primary body text */
  --color-text-secondary: ;    /* Subdued text, captions */
  --color-text-tertiary: ;     /* Disabled, placeholder text */
  --color-text-inverse: ;      /* Text on dark/accent backgrounds */
  --color-heading: ;           /* Headings (slightly brighter/bolder) */
  --color-link: ;              /* Link text color */
  --color-link-hover: ;        /* Link hover color */

  /* === BORDERS === */
  --color-border: ;            /* Default border */
  --color-border-light: ;      /* Subtle/secondary border */
  --color-border-heavy: ;      /* Prominent border */
  --color-border-focus: ;      /* Focus ring color (accessibility) */

  /* === SEMANTIC === */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-success-bg: rgba(16, 185, 129, 0.1);

  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-warning-bg: rgba(245, 158, 11, 0.1);

  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-error-bg: rgba(239, 68, 68, 0.1);

  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
  --color-info-bg: rgba(59, 130, 246, 0.1);
}
```

### 4. WCAG AA Contrast Verification

Calculate and verify contrast ratios for ALL key combinations:

| Combination | Required Ratio | Actual Ratio | Status |
|-------------|---------------|-------------|--------|
| `--color-text` on `--color-bg` | 4.5:1 (AA) | [X]:1 | PASS/FAIL |
| `--color-text` on `--color-surface` | 4.5:1 (AA) | [X]:1 | PASS/FAIL |
| `--color-heading` on `--color-bg` | 3:1 (AA Large) | [X]:1 | PASS/FAIL |
| `--color-text-secondary` on `--color-bg` | 4.5:1 (AA) | [X]:1 | PASS/FAIL |
| `--color-text-inverse` on `--color-accent` | 4.5:1 (AA) | [X]:1 | PASS/FAIL |
| `--color-text-inverse` on `--color-primary` | 4.5:1 (AA) | [X]:1 | PASS/FAIL |
| `--color-accent` on `--color-bg` | 3:1 (interactive) | [X]:1 | PASS/FAIL |
| `--color-link` on `--color-bg` | 4.5:1 (AA) | [X]:1 | PASS/FAIL |
| `--color-border-focus` on `--color-bg` | 3:1 (interactive) | [X]:1 | PASS/FAIL |

**Contrast calculation formula:**
```
Relative luminance: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
(where R, G, B are linearized: if sRGB <= 0.03928 then sRGB/12.92 else ((sRGB+0.055)/1.055)^2.4)
Contrast ratio: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter
```

If ANY combination fails, adjust the color until it passes. Document the adjustment.

### 5. Light Theme Variant (if mode: light or both)

Generate a `[data-theme="light"]` or `@media (prefers-color-scheme: light)` override:

```css
[data-theme="light"],
@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #ffffff;
    --color-bg-alt: #f8fafc;
    --color-surface: #f1f5f9;
    --color-text: #1e293b;
    --color-text-secondary: #475569;
    --color-heading: #0f172a;
    --color-border: #e2e8f0;
    /* ... all overrides ... */
  }
}
```

### 6. Generate Visual Preview

Create a simple HTML snippet that demonstrates the palette:

```html
<!-- Palette Preview -->
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; padding: 20px;">
  <div style="background: var(--color-primary); padding: 20px; border-radius: 8px; color: var(--color-text-inverse); text-align: center; font-size: 12px;">
    Primary<br><small>[hex]</small>
  </div>
  <!-- ... for each color ... -->
</div>
```

## Output Format

```
## Color Palette — [Industry] Theme
**Mode**: [dark/light/both]
**Brand Color**: [hex or "industry default"]
**Mood**: [mood]
**Date**: [date]

### Palette Overview
[Visual description of the palette and its psychological intent for this industry]

### Color Swatches
| Token | Hex | RGB | Purpose |
|-------|-----|-----|---------|
| Primary | #xxx | rgb(x,x,x) | [purpose] |
| Secondary | #xxx | rgb(x,x,x) | [purpose] |
| Accent | #xxx | rgb(x,x,x) | [purpose] |
| ... | ... | ... | ... |

### Contrast Verification
[Contrast table from step 4]

### CSS Custom Properties
[Complete CSS code block — ready to paste]

### Preview HTML
[HTML snippet for visual preview]

### Usage Notes
- **CTA Buttons**: Use `--color-accent` background with `--color-text-inverse` text
- **Cards**: Use `--color-surface` with `--color-border`
- **Headings**: Use `--color-heading` for all h1-h6
- **Links**: Use `--color-link`, hover = `--color-link-hover`
- **Focus rings**: Use `--color-border-focus` with 2px solid outline + 2px offset
```

## Rules

- **Accessibility is non-negotiable.** Every text-on-background combination MUST pass WCAG AA. No exceptions. No "close enough."
- **Industry psychology matters.** A law firm getting a playful pink palette is a failure. The colors must match the emotional expectation of the industry.
- **Brand color is king.** When provided, the brand color drives everything. Don't fight it — work with it.
- **Complete output only.** Every CSS variable must have a value. No `[TODO]` or empty strings.
- **RGB values included.** Always provide `--color-*-rgb` variants for the primary and accent colors so `rgba()` can be used.
- **Dark mode is the default.** We build dark-first because it looks better and `/build-site` defaults to dark.
- **This feeds directly into `/design-system`, `/build-site`, and `/landing-page`.** The CSS output must be compatible.
