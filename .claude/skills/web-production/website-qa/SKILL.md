---
name: website-qa
description: Website quality assurance — full checklist with Playwright tests for links, forms, accessibility, performance, mobile nav, and cross-browser notes before client delivery
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Website QA — Website Quality Assurance

You are performing a comprehensive quality assurance check on a built website before delivery to a client. This is the final gate -- nothing ships until it passes QA. You run automated Playwright tests AND a manual checklist review.

## Invocation

`/website-qa [file-path] [scope: full|quick]`

**Arguments:**
- `[file-path]` -- Required. Path to the HTML file (or directory of files) to test.
- `[scope: ...]` -- Optional. `full` runs everything including responsive checks. `quick` skips screenshots and responsive testing. Defaults to `full`.

**Examples:**
- `/website-qa ./mikes-plumbing.html` -- Full QA before delivery
- `/website-qa ./site/ scope: quick` -- Quick check on a directory of HTML files

## Steps

### 1. Static Analysis (Read the Code)

Read the HTML file(s) and check for:

#### HTML Quality
- [ ] `<!DOCTYPE html>` declaration present
- [ ] `<html lang="en">` language attribute set
- [ ] `<meta charset="UTF-8">` in head
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">` present
- [ ] `<title>` tag present and descriptive (50-60 chars)
- [ ] `<meta name="description">` present (150-160 chars)
- [ ] Semantic HTML5 elements used (header, main, section, footer, nav, article)
- [ ] No duplicate IDs
- [ ] All img tags have alt attributes
- [ ] All anchor tags have meaningful text (no "click here")
- [ ] Favicon present (link tag or inline SVG)

#### CSS Quality
- [ ] CSS custom properties used for theming (root variables)
- [ ] Mobile-first or responsive media queries present
- [ ] prefers-reduced-motion media query present
- [ ] Print styles (media print) present
- [ ] No hardcoded colors outside of root (check for inline colors)
- [ ] Custom scrollbar styles (optional but preferred)
- [ ] Focus styles for keyboard navigation (focus, focus-visible)

#### JavaScript Quality
- [ ] No external script dependencies (CDN links)
- [ ] No console.log statements left in production code
- [ ] Event listeners properly attached
- [ ] IntersectionObserver used for scroll animations (not scroll event listener)

#### SEO
- [ ] Open Graph meta tags present (og:title, og:description, og:image)
- [ ] Twitter card meta tags present
- [ ] Canonical URL tag present
- [ ] Structured data (JSON-LD) present and valid syntax
- [ ] Heading hierarchy correct (H1 then H2 then H3, no skipped levels)
- [ ] Only ONE H1 per page

#### Accessibility (WCAG AA Basics)
- [ ] Color contrast meets 4.5:1 for normal text (spot check key combinations)
- [ ] Interactive elements have focus styles
- [ ] Images have alt text
- [ ] Form inputs have associated label elements
- [ ] ARIA attributes used correctly (or not needed because of semantic HTML)
- [ ] Skip-to-content link present (nice to have)
- [ ] Touch targets minimum 44x44px for interactive elements

### 2. Automated Playwright Tests

Generate and run a Playwright test script that tests:

**Test 1: Page loads without errors**
- Listen for page errors and console errors
- PASS if zero errors

**Test 2: All internal links work**
- Find all anchor tags with href
- For anchor links (containing #), verify target element exists
- PASS if all anchors resolve

**Test 3: All CTAs are clickable**
- Find all buttons, CTA links, tel: links
- Verify each is visible and has a bounding box
- PASS if all CTAs are interactive

**Test 4: Forms validate correctly**
- Find all forms
- Count required fields
- Try submitting empty -- verify HTML5 validation prevents it
- PASS if validation works

**Test 5: Mobile navigation toggle works**
- Set viewport to 375x812
- Find hamburger/nav toggle element
- Click it
- Verify nav menu becomes visible
- PASS if toggle works

**Test 6: Scroll animations fire**
- Scroll to bottom of page
- Wait for animations
- Check for elements with visible/animated classes
- PASS if animations trigger

**Test 7: Phone links are click-to-call**
- Find all tel: links
- PASS if at least one exists, WARN if none

**Test 8: Images have alt text**
- Find all img elements
- Check each has a non-empty alt attribute
- PASS if all have alt text

**Test 9: No JavaScript errors**
- Check collected errors from test 1
- PASS if no errors were logged

**Test 10: Self-contained (no external resources)**
- Count external stylesheet links and script src attributes
- PASS if zero external resources

**Performance metrics to collect:**
- DOM element count
- Number of images
- Number of script blocks
- Number of style blocks
- External resource count

### 3. Responsive Check Integration

If scope is full, run the responsive-check skill on the file to get breakpoint screenshots and responsive validation.

### 4. Cross-Browser Notes

Generate cross-browser compatibility notes:
- **Backdrop-filter**: Not supported in Firefox below version 103. Provide fallback background color.
- **CSS Grid**: Supported in all modern browsers. IE11 needs -ms-grid prefix (not recommended).
- **Smooth scroll**: Not supported in Safari below 15.4. Degrades gracefully.
- **Custom scrollbar**: WebKit only (Chrome, Edge, Safari). Firefox uses scrollbar-width and scrollbar-color.
- **focus-visible**: Supported in all modern browsers since 2022.

### 5. Placeholder Detection

Search the entire file for common placeholder strings that should be replaced before delivery:
- "lorem ipsum" (case insensitive)
- "example.com"
- "555-" (fake phone number prefix)
- "123 Main St" or "123 Fake St"
- "John Doe" or "Jane Doe"
- "Your Company" or "Company Name"
- "TODO" or "FIXME" or "PLACEHOLDER"
- "[replace" or "[insert" or "[your"
- "test@" email addresses

Flag each as MUST FIX before delivery.

### 6. Generate QA Report

Compile all findings into a structured report.

## Output Format

```
## Website QA Report -- [filename]
**Date**: [date]
**Scope**: [full/quick]
**Overall**: PASS / FAIL / [X] issues found
**Score**: [X/100]

### Automated Tests
| # | Test | Result | Details |
|---|------|--------|---------|
| 1 | Page loads without errors | PASS/FAIL | [details] |
| 2 | Internal links work | PASS/FAIL | [details] |
| 3 | CTAs clickable | PASS/FAIL | [details] |
| 4 | Form validation | PASS/FAIL | [details] |
| 5 | Mobile nav toggle | PASS/FAIL | [details] |
| 6 | Scroll animations | PASS/FAIL | [details] |
| 7 | Click-to-call links | PASS/WARN | [details] |
| 8 | Image alt text | PASS/FAIL | [details] |
| 9 | No JS errors | PASS/FAIL | [details] |
| 10 | Self-contained | PASS/FAIL | [details] |

### Static Analysis
#### HTML [X/11 pass]
[Checklist results]

#### CSS [X/7 pass]
[Checklist results]

#### JavaScript [X/4 pass]
[Checklist results]

#### SEO [X/6 pass]
[Checklist results]

#### Accessibility [X/7 pass]
[Checklist results]

### Performance Metrics
| Metric | Value | Status |
|--------|-------|--------|
| DOM Elements | [X] | OK / HIGH |
| Images | [X] | [notes] |
| External Resources | [X] | 0 = PASS |
| File Size | [X KB] | [notes] |

### Placeholder Check
[List of any placeholder text found -- MUST FIX]

### Responsive (if full scope)
[Summary from responsive-check]

### Cross-Browser Notes
[Compatibility notes]

### Issues and Fixes
#### Must Fix Before Delivery
1. [issue] -- [fix]

#### Should Fix
1. [issue] -- [fix]

#### Nice to Have
1. [issue] -- [fix]

### Delivery Checklist
- [ ] All Must Fix items resolved
- [ ] Client name/info is correct (not placeholder)
- [ ] Phone number is real and click-to-call
- [ ] Address is correct
- [ ] No placeholder text remaining
- [ ] Favicon is appropriate
- [ ] Social media links are real (or removed)
- [ ] Copyright year is current
- [ ] File is ready to deploy via /deploy-site
```

## Rules

- **Nothing ships with a FAIL.** Must Fix items are blockers. Period.
- **Placeholder detection is critical.** Search for lorem ipsum, example.com, 555-, 123 Main St, John Doe, Your Company. If found, flag as MUST FIX.
- **Test the file, do not just read it.** Playwright tests catch issues that code review misses (JS errors, broken anchors, invisible elements).
- **Be specific about fixes.** Do not just say "add alt text." Say exactly WHAT alt text to add and WHERE.
- **Score honestly.** 100/100 means production-ready. 80+ means minor issues. Below 70 means significant rework needed.
- **This is the final gate.** After QA passes, the site goes to /deploy-site and then /email-campaign. Catching issues here saves embarrassment.
- **Clean up test artifacts.** Delete the test script after running. Keep the report.
