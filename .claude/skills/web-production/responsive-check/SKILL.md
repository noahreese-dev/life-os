---
name: responsive-check
description: Responsive design validator — screenshots a built HTML file at 6 breakpoints via Playwright, checks for overflow, touch targets, readability, and navigation usability
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Responsive Check — Responsive Design Validator

You are validating a built HTML file across all standard breakpoints using Playwright. This catches responsive issues BEFORE the client ever sees the site.

## Invocation

`/responsive-check [file-path] [full: true|false]`

**Arguments:**
- `[file-path]` — Required. Path to the HTML file to test.
- `[full: true]` — Optional. If true, takes full-page screenshots (not just viewport). Defaults to false (viewport only).

**Examples:**
- `/responsive-check ./mikes-plumbing.html` — Quick viewport check at all breakpoints
- `/responsive-check ./site.html full: true` — Full-page screenshots at all breakpoints

## Steps

### 1. Verify Prerequisites

- Confirm the HTML file exists at the specified path
- Check that Playwright is installed: `npx playwright --version`
- If not installed, run: `npx playwright install chromium`

### 2. Create Test Script

Generate a Playwright test script that:

```javascript
const { chromium } = require('playwright');
const path = require('path');

const BREAKPOINTS = [
  { name: 'mobile-s',  width: 320,  height: 568,  label: 'Mobile S (iPhone SE)' },
  { name: 'mobile',    width: 375,  height: 812,  label: 'Mobile (iPhone X)' },
  { name: 'tablet',    width: 768,  height: 1024, label: 'Tablet (iPad)' },
  { name: 'laptop',    width: 1024, height: 768,  label: 'Laptop' },
  { name: 'desktop',   width: 1440, height: 900,  label: 'Desktop' },
  { name: 'wide',      width: 1920, height: 1080, label: 'Wide (1080p)' },
];

(async () => {
  const browser = await chromium.launch();
  const filePath = process.argv[2];
  const fullPage = process.argv[3] === 'full';
  const results = [];

  for (const bp of BREAKPOINTS) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: bp.width <= 375 ? 2 : 1,
    });
    const page = await context.newPage();
    await page.goto(`file://${path.resolve(filePath)}`);
    await page.waitForLoadState('networkidle');

    // Screenshot
    const screenshotPath = `responsive-${bp.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage });

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Check touch targets (min 44px)
    const smallTouchTargets = await page.evaluate(() => {
      const interactive = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
      const issues = [];
      interactive.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.width < 44 || rect.height < 44) {
            issues.push({
              tag: el.tagName,
              text: el.textContent?.trim().substring(0, 30),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        }
      });
      return issues;
    });

    // Check font sizes (min 14px for readability)
    const smallFonts = await page.evaluate(() => {
      const allText = document.querySelectorAll('p, span, li, td, th, a, label');
      const issues = [];
      allText.forEach(el => {
        const size = parseFloat(window.getComputedStyle(el).fontSize);
        if (size < 14 && el.textContent?.trim().length > 0) {
          issues.push({
            tag: el.tagName,
            text: el.textContent?.trim().substring(0, 30),
            size: Math.round(size),
          });
        }
      });
      return issues;
    });

    // Check images for scaling issues
    const imageIssues = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const issues = [];
      imgs.forEach(img => {
        if (img.naturalWidth > 0 && img.width > img.naturalWidth * 1.5) {
          issues.push({
            src: img.src.substring(0, 50),
            natural: img.naturalWidth,
            rendered: img.width,
          });
        }
      });
      return issues;
    });

    // Check navigation visibility
    const navVisible = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return 'NO_NAV';
      const style = window.getComputedStyle(nav);
      return style.display !== 'none' && style.visibility !== 'hidden' ? 'VISIBLE' : 'HIDDEN';
    });

    // Check for text truncation (ellipsis)
    const truncatedText = await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      const issues = [];
      all.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.overflow === 'hidden' && style.textOverflow === 'ellipsis') {
          if (el.scrollWidth > el.clientWidth) {
            issues.push({
              tag: el.tagName,
              text: el.textContent?.trim().substring(0, 30),
            });
          }
        }
      });
      return issues;
    });

    results.push({
      breakpoint: bp,
      screenshot: screenshotPath,
      overflow: hasOverflow,
      smallTouchTargets,
      smallFonts,
      imageIssues,
      navVisible,
      truncatedText,
    });

    await context.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
```

### 3. Run the Tests

Execute the script:
```bash
node responsive-check.js [file-path] [full]
```

Parse the JSON output for each breakpoint.

### 4. Analyze Screenshots

Read each screenshot using the Read tool to visually inspect:
- Layout integrity — do sections look correct?
- Content reflow — do grids collapse properly?
- Navigation — is it accessible on mobile? Does hamburger work?
- CTA visibility — is the primary CTA visible above the fold?
- Text readability — is body text large enough?
- Spacing — is there enough breathing room between elements?
- Images — do they scale correctly?

### 5. Generate Report

Compile all findings into a structured report.

## Output Format

```
## Responsive Check Report — [filename]
**Date**: [date]
**Breakpoints Tested**: 6 (320px → 1920px)
**Overall**: PASS / FAIL / [X] ISSUES

### Breakpoint Results

| Breakpoint | Viewport | Overflow | Touch Targets | Fonts | Nav | Status |
|------------|----------|----------|---------------|-------|-----|--------|
| Mobile S   | 320x568  | OK/FAIL  | OK/X issues   | OK/X  | OK  | PASS/FAIL |
| Mobile     | 375x812  | OK/FAIL  | OK/X issues   | OK/X  | OK  | PASS/FAIL |
| Tablet     | 768x1024 | OK/FAIL  | OK/X issues   | OK/X  | OK  | PASS/FAIL |
| Laptop     | 1024x768 | OK/FAIL  | OK/X issues   | OK/X  | OK  | PASS/FAIL |
| Desktop    | 1440x900 | OK/FAIL  | OK/X issues   | OK/X  | OK  | PASS/FAIL |
| Wide       | 1920x1080| OK/FAIL  | OK/X issues   | OK/X  | OK  | PASS/FAIL |

### Issues Found

#### Critical (breaks usability)
1. [Breakpoint]: [issue description] — [suggested fix]

#### Warning (degrades experience)
1. [Breakpoint]: [issue description] — [suggested fix]

#### Info (nice to fix)
1. [Breakpoint]: [issue description] — [suggested fix]

### Screenshots
- `responsive-mobile-s.png` — [notes]
- `responsive-mobile.png` — [notes]
- `responsive-tablet.png` — [notes]
- `responsive-laptop.png` — [notes]
- `responsive-desktop.png` — [notes]
- `responsive-wide.png` — [notes]

### Auto-Fix Suggestions
[Specific CSS fixes for any issues found, ready to paste]
```

## Rules

- **Screenshots are proof.** Always generate screenshots. The CEO wants visual confirmation, not just a JSON report.
- **Touch targets matter.** On mobile, anything interactive MUST be at least 44x44px. This is not optional — it's a Google ranking factor AND usability requirement.
- **Overflow is critical.** Horizontal scroll on mobile is an instant fail. Fix it.
- **Font readability.** Text below 14px on mobile is unreadable for most users. Flag it.
- **Test the hamburger.** If there's a mobile nav toggle, verify it actually works.
- **Be constructive.** Don't just say "FAIL" — provide the CSS fix. The agent running this should be able to auto-fix issues.
- **This feeds into `/website-qa`.** Responsive check is one part of the full QA process.
- **Clean up after yourself.** Delete the test script after running. Keep the screenshots for the report.
