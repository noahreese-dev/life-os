---
name: seo-audit
description: SEO analysis & optimization — audit a website or business for search engine opportunities, keyword gaps, and priority fixes
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(ls*), Bash(date*), WebSearch, WebFetch
---

# SEO Audit — SEO Analysis & Optimization

You are performing a comprehensive SEO audit for a website or business. This skill is used by any agent building or auditing a website — whether for an existing client site, a cold outreach prospect, or a brand-new build.

## Invocation

`/seo-audit [target] [type: site|business|competitor]`

**Arguments:**
- `[target]` — Required. URL of the website to audit, OR business name + city for businesses without a website.
- `[type: ...]` — Optional. Defaults to `site` if a URL is provided, `business` if just a name.

**Examples:**
- `/seo-audit https://example.com` — Full site audit
- `/seo-audit "Joe's Plumbing Hamilton"` — Business without a website, competitor analysis
- `/seo-audit https://competitor.com type: competitor` — Audit a competitor to find gaps we can exploit

## Steps

### 1. Gather Information

**For existing websites (`type: site`):**
- Fetch the homepage and key pages using WebFetch
- Extract: title tags, meta descriptions, heading hierarchy (H1-H6), image alt text, internal links, external links
- Check for: robots.txt, sitemap.xml, canonical tags, structured data (JSON-LD), Open Graph tags
- Note: page load indicators (large images, excessive scripts, render-blocking resources)

**For businesses without websites (`type: business`):**
- WebSearch for the business name + city to find their online presence (Google Maps, Yelp, directories)
- WebSearch for top 3-5 competitors in the same industry + city
- Audit competitor websites to identify keyword targets and content gaps
- Check if the business has Google Business Profile, Yelp, social media

**For competitor audits (`type: competitor`):**
- Full site audit as above, PLUS
- Extract their keyword strategy (what terms they rank for based on content)
- Identify their content gaps and weaknesses we can exploit
- Note their backlink sources (directories, citations) we should also be listed on

### 2. Technical SEO Check

Evaluate the following (pass/fail/missing for each):

| Check | What to Look For |
|-------|-----------------|
| **Title Tags** | Present, unique per page, 50-60 chars, includes primary keyword |
| **Meta Descriptions** | Present, unique, 150-160 chars, includes CTA + keyword |
| **H1 Tags** | Exactly one per page, includes primary keyword |
| **Heading Hierarchy** | Proper nesting (H1 > H2 > H3), no skipped levels |
| **Image Alt Text** | All images have descriptive alt text with keywords where natural |
| **URL Structure** | Clean, readable, hyphenated, includes keywords |
| **Internal Linking** | Key pages linked from homepage, logical site structure |
| **Mobile Viewport** | `<meta name="viewport">` present and correct |
| **Canonical Tags** | Present on all pages, self-referencing |
| **Robots.txt** | Exists, not blocking important pages |
| **Sitemap** | XML sitemap exists and is referenced in robots.txt |
| **SSL/HTTPS** | Site uses HTTPS (note if HTTP) |
| **Structured Data** | JSON-LD present (LocalBusiness, Organization, etc.) |
| **Open Graph Tags** | og:title, og:description, og:image present |
| **Page Speed Indicators** | Large unoptimized images, render-blocking scripts, excessive DOM size |

### 3. Content & Keyword Analysis

- Identify the primary keyword theme of each page
- Check keyword density (target: 1-2% for primary keyword, natural usage)
- Look for keyword cannibalization (multiple pages targeting the same keyword)
- Identify missing content opportunities:
  - Service pages that should exist but don't
  - FAQ content (rich snippet opportunity)
  - Blog/resource content for long-tail keywords
  - Location-specific pages for local SEO

### 4. Local SEO Assessment (if applicable)

- **NAP Consistency**: Is Name, Address, Phone consistent across the site?
- **Google Business Profile**: Does it exist? Is it claimed? Is it optimized?
- **Local Keywords**: Are "[service] + [city]" keywords present in content?
- **Schema Markup**: LocalBusiness JSON-LD with correct NAP, hours, services?
- **Google Maps**: Embedded on contact page?
- **Reviews**: Are reviews displayed? Is there a review acquisition strategy?
- **Citations**: Is the business listed on major directories (Yelp, YellowPages, BBB, industry-specific)?

### 5. Competitor Gap Analysis

For the top 3 competitors:
- What keywords do they target that the subject does not?
- What content types do they have that the subject lacks?
- What local citations do they have?
- What is their content freshness (last updated dates)?
- Where are they weak that we can be strong?

### 6. Generate Priority Action Plan

Categorize all findings into:

**Critical (fix immediately):**
- Missing title tags or meta descriptions
- No mobile viewport
- Broken pages or 404 errors
- No SSL/HTTPS
- Blocked by robots.txt

**High Priority (this week):**
- Missing structured data
- No local SEO optimization
- Poor heading hierarchy
- Missing image alt text
- No sitemap

**Medium Priority (this month):**
- Content gaps (missing service pages, FAQ)
- Keyword optimization improvements
- Internal linking improvements
- Speed optimization

**Low Priority (ongoing):**
- Blog content strategy
- Backlink acquisition
- Social media integration
- Review acquisition strategy

## Output Format

```
## SEO Audit Report — [Target]
**Date**: [Date]
**Type**: [Site / Business / Competitor]
**Overall Score**: [X/100]

### Technical SEO
| Check | Status | Notes |
|-------|--------|-------|
| Title Tags | PASS/FAIL/MISSING | [Details] |
| ... | ... | ... |

### Content Analysis
- **Primary Keywords**: [list]
- **Missing Opportunities**: [list]
- **Content Gaps vs Competitors**: [list]

### Local SEO
- **NAP Consistent**: YES/NO
- **Google Business**: CLAIMED/UNCLAIMED/MISSING
- **Local Schema**: YES/NO
- **Citation Count**: [X] found

### Competitor Comparison
| Factor | Subject | Competitor 1 | Competitor 2 |
|--------|---------|-------------|-------------|
| Title optimization | ... | ... | ... |
| Content depth | ... | ... | ... |
| Local signals | ... | ... | ... |

### Priority Actions
**Critical**: [numbered list]
**High**: [numbered list]
**Medium**: [numbered list]
**Low**: [numbered list]

### Quick Wins (implement in < 1 hour)
1. [action] — [expected impact]
2. [action] — [expected impact]
3. [action] — [expected impact]
```

## Rules

- **Be specific, not generic.** "Improve your SEO" is worthless. "Add 'plumber hamilton ontario' to your H1 tag on the homepage" is actionable.
- **Score honestly.** Don't inflate scores. A site with no structured data, no sitemap, and poor meta tags is a 30/100, not a 65.
- **Prioritize revenue impact.** Local SEO fixes for a local business trump blog strategy. Rank actions by business impact.
- **For businesses without websites:** Focus the audit on competitor analysis and keyword opportunity. The output should make it obvious WHY they need a website and what keywords they'd rank for.
- **Include the "so what."** For each finding, explain the business impact. "Missing structured data" means nothing to a business owner. "Google can't show your hours, reviews, and services in search results" does.
- **This feeds into other skills.** The keyword list feeds `/copy-write`. The technical gaps feed `/website-qa`. The local SEO gaps feed `/local-seo`. Reference these connections.
