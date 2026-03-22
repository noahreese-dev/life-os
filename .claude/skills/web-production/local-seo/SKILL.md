---
name: local-seo
description: Local business SEO package — generates Schema.org structured data, Google Maps embed, NAP consistency, local keyword research, meta tags, Open Graph, robots.txt, and sitemap suggestions
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash(ls*), Bash(date*), WebSearch, WebFetch
---

# Local SEO — Local Business SEO Package

You are generating a complete local SEO package for a business. This produces all the technical SEO assets a local business needs to rank in Google Maps and local search results — ready-to-paste code blocks.

## Invocation

`/local-seo [business-name] [industry: type] [address: full-address] [phone: number] [hours: schedule] [services: list]`

**Arguments:**
- `[business-name]` — Required. Full legal business name.
- `[industry: type]` — Optional. For schema type selection. Auto-detected if not specified.
- `[address: ...]` — Required for full output. Street address, city, province/state, postal code.
- `[phone: ...]` — Required for full output. Business phone number.
- `[hours: ...]` — Optional. Business hours (e.g., "Mon-Fri 8am-6pm, Sat 9am-2pm").
- `[services: ...]` — Optional. Comma-separated list of services.

**Examples:**
- `/local-seo "Mike's Plumbing" address: "123 Main St, Hamilton, ON L8P 1A1" phone: "905-555-1234"`
- `/local-seo "Bella's Salon" industry: beauty address: "456 King St, Hamilton, ON" phone: "905-555-5678" hours: "Tue-Sat 9am-7pm"`

## Steps

### 1. Schema.org LocalBusiness Structured Data (JSON-LD)

Generate complete JSON-LD structured data following Schema.org specifications.

Map industry to the correct schema type:
| Industry | Schema Type |
|----------|-------------|
| restaurant | `Restaurant` |
| trades (plumber) | `Plumber` |
| trades (electrician) | `Electrician` |
| trades (HVAC) | `HVACBusiness` |
| trades (general) | `HomeAndConstructionBusiness` |
| beauty | `BeautySalon` / `HairSalon` |
| pet-care | `PetStore` / `VeterinaryCare` |
| medical | `MedicalBusiness` / `Physician` |
| legal | `LegalService` / `Attorney` |
| real-estate | `RealEstateAgent` |
| automotive | `AutoRepair` / `AutoDealer` |
| retail | `Store` |
| fitness | `HealthClub` / `ExerciseGym` |
| dental | `Dentist` |

Generate:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "[SchemaType]",
  "name": "[Business Name]",
  "description": "[80-150 char description with primary keyword + city]",
  "url": "[website URL]",
  "telephone": "[phone]",
  "email": "[email if provided]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[street]",
    "addressLocality": "[city]",
    "addressRegion": "[province/state]",
    "postalCode": "[postal code]",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[lat — note: requires lookup]",
    "longitude": "[lng — note: requires lookup]"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ],
  "priceRange": "$$",
  "image": "[logo URL if available]",
  "sameAs": [
    "[Facebook URL]",
    "[Instagram URL]",
    "[Google Business URL]"
  ],
  "areaServed": [
    {
      "@type": "City",
      "name": "[City]"
    },
    {
      "@type": "City",
      "name": "[Nearby City 1]"
    },
    {
      "@type": "City",
      "name": "[Nearby City 2]"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "[Business Name] Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "[Service 1]",
          "description": "[Service 1 description with keywords]"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5"
  }
}
</script>
```

**Notes for the developer:**
- Comment which fields need real data vs. placeholders
- Include instructions for finding lat/lng coordinates
- Note that `aggregateRating` should only be included if reviews actually exist

### 2. FAQ Structured Data

Generate FAQ schema for rich snippet eligibility:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question with long-tail keyword]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer with keywords woven naturally, 50-200 words]"
      }
    }
  ]
}
</script>
```

Generate 5-7 FAQ entries targeting long-tail local keywords:
- "How much does [service] cost in [city]?"
- "What is the best [service provider] in [city]?"
- "Does [business name] offer emergency [service]?"
- "What areas does [business name] serve?"
- "How do I choose a [service provider] in [city]?"

### 3. Google Maps Embed

Generate the Maps embed code:

```html
<!-- Google Maps Embed -->
<iframe
  src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=[Business+Name+Address+Encoded]"
  width="100%"
  height="400"
  style="border:0; border-radius: 12px;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="[Business Name] Location — [City]">
</iframe>

<!-- Alternative: No API key needed (uses search query) -->
<iframe
  src="https://www.google.com/maps?q=[Address+URL+Encoded]&output=embed"
  width="100%"
  height="400"
  style="border:0; border-radius: 12px;"
  allowfullscreen=""
  loading="lazy"
  title="[Business Name] Location — [City]">
</iframe>
```

### 4. NAP Consistency Block

Generate a standardized NAP (Name, Address, Phone) block:

```html
<!-- NAP Block — Use this EXACT format everywhere (footer, contact page, about page) -->
<div class="nap" itemscope itemtype="https://schema.org/LocalBusiness">
  <strong itemprop="name">[Business Name]</strong><br>
  <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="streetAddress">[Street Address]</span><br>
    <span itemprop="addressLocality">[City]</span>,
    <span itemprop="addressRegion">[Province/State]</span>
    <span itemprop="postalCode">[Postal Code]</span>
  </span><br>
  <a href="tel:+1[PhoneDigitsOnly]" itemprop="telephone">[Formatted Phone]</a>
</div>
```

**NAP Consistency Checklist:**
- [ ] Business name spelled EXACTLY the same everywhere (including "Inc.", "LLC", etc.)
- [ ] Address format matches Google Business Profile
- [ ] Phone number format consistent (pick one: (905) 555-1234 or 905-555-1234)
- [ ] Same NAP on: website footer, contact page, Google Business, Yelp, Facebook, all directories

### 5. Local Keyword Research

Generate keyword targets in three tiers:

**Tier 1 — High Intent (target on homepage + service pages):**
- `[service] [city]` — e.g., "plumber Hamilton"
- `[service] near me` — e.g., "plumber near me"
- `best [service] [city]` — e.g., "best plumber Hamilton"
- `[service] [city] [province]` — e.g., "plumber Hamilton Ontario"
- `emergency [service] [city]` — e.g., "emergency plumber Hamilton"

**Tier 2 — Service-Specific (target on individual service pages):**
- `[specific service] [city]` — e.g., "drain cleaning Hamilton"
- `[specific service] cost [city]` — e.g., "drain cleaning cost Hamilton"
- `residential [service] [city]` — e.g., "residential plumber Hamilton"
- `commercial [service] [city]` — e.g., "commercial plumber Hamilton"

**Tier 3 — Long-Tail (target in blog/FAQ content):**
- `how much does [service] cost in [city]` — FAQ content
- `[service] vs [alternative] [city]` — comparison content
- `when to call a [service provider] [city]` — educational content
- `[service] tips for [city] homeowners` — blog content

**Tier 4 — Neighborhood Targeting (if applicable):**
- `[service] [neighborhood]` — e.g., "plumber Westdale"
- `[service] [nearby city]` — e.g., "plumber Burlington"
- List top 5-10 neighborhoods and nearby cities for the service area

### 6. Meta Tags Package

```html
<!-- Primary Meta Tags -->
<title>[Primary Keyword] — [Business Name] | [City], [Province]</title>
<meta name="description" content="[150-160 chars with keyword + CTA]">
<meta name="keywords" content="[comma-separated keyword list]">
<meta name="robots" content="index, follow">
<link rel="canonical" href="[canonical URL]">

<!-- Geographic Meta Tags -->
<meta name="geo.region" content="CA-ON">
<meta name="geo.placename" content="[City]">
<meta name="geo.position" content="[latitude];[longitude]">
<meta name="ICBM" content="[latitude], [longitude]">
```

### 7. Open Graph Tags

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="business.business">
<meta property="og:title" content="[Business Name] — [Tagline]">
<meta property="og:description" content="[Description with keyword]">
<meta property="og:url" content="[URL]">
<meta property="og:image" content="[Image URL — 1200x630px recommended]">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="[Business Name]">
<meta property="og:locale" content="en_CA">
<meta property="business:contact_data:street_address" content="[Street]">
<meta property="business:contact_data:locality" content="[City]">
<meta property="business:contact_data:region" content="[Province]">
<meta property="business:contact_data:postal_code" content="[Postal Code]">
<meta property="business:contact_data:country_name" content="Canada">
<meta property="business:contact_data:phone_number" content="[Phone]">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Business Name] — [Tagline]">
<meta name="twitter:description" content="[Description]">
<meta name="twitter:image" content="[Image URL]">
```

### 8. Robots.txt & Sitemap

```
# robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://[domain]/sitemap.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://[domain]/</loc>
    <lastmod>[date]</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://[domain]/services</loc>
    <lastmod>[date]</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://[domain]/contact</loc>
    <lastmod>[date]</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://[domain]/about</loc>
    <lastmod>[date]</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

## Output Format

```
## Local SEO Package — [Business Name]
**Industry**: [type]
**Location**: [City, Province]
**Date**: [date]

---

### 1. Structured Data (JSON-LD)
[Code block — paste into <head>]

### 2. FAQ Schema
[Code block — paste into <head>]

### 3. Google Maps Embed
[Code block — paste into contact section]

### 4. NAP Block
[Code block — paste into footer]
[NAP consistency checklist]

### 5. Local Keywords
[Three-tier keyword list]

### 6. Meta Tags
[Code block — paste into <head>]

### 7. Open Graph Tags
[Code block — paste into <head>]

### 8. Robots.txt
[Code block — save as robots.txt in root]

### 9. Sitemap
[Code block — save as sitemap.xml in root]

### Implementation Checklist
- [ ] Add JSON-LD to homepage <head>
- [ ] Add FAQ schema to homepage <head>
- [ ] Embed Google Maps on contact page
- [ ] Use NAP block in footer (every page)
- [ ] Set meta tags on every page
- [ ] Add OG tags for social sharing
- [ ] Upload robots.txt to root
- [ ] Generate and upload sitemap.xml
- [ ] Submit sitemap to Google Search Console
- [ ] Verify Google Business Profile is claimed and optimized
- [ ] List on top 10 local directories
```

## Rules

- **NAP consistency is everything.** One different character between the website and Google Business Profile can hurt rankings. Be exact.
- **Schema must be valid.** Test with Google's Rich Results Test (https://search.google.com/test/rich-results). Include the test URL in the output.
- **Don't fake reviews.** Only include `aggregateRating` in schema if the business actually has reviews. Include a comment noting this.
- **Geo-coordinates are best-effort.** Note when lat/lng need to be looked up and provide instructions for finding them.
- **Keywords must sound natural.** If a keyword reads awkwardly in copy ("plumber Hamilton Ontario residential"), rewrite the sentence, don't force the keyword.
- **This feeds into `/landing-page`, `/build-site`, and `/seo-audit`.** All code blocks should be drop-in ready for those skills.
- **Include the "why."** For each block, briefly explain what it does and why it matters. The CEO uses these packages in client presentations.
