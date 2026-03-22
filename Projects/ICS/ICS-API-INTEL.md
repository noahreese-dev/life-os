# ICS API Intelligence Report

## The $10K Question

ICS charges an **API access fee** for third-party integration with WashConnect. The exact amount was quoted to the CEO as ~$10,000. This is consistent with industry practice — Rinsed's partnership announcement specifically mentions "eliminating API-access fees typically required by most point-of-sale vendors."

### What the API Likely Includes

Based on Flower Press Interactive's integration work (Brown Bear Wash Club app), Rinsed's CRM integration, and WashConnect's data model, the ICS API likely provides:

#### Customer Management Endpoints
- Create/read/update customer accounts
- Vehicle information (VIN, license plate)
- Membership status (active, suspended, terminated)
- Membership history
- PIN management
- Cards on File (tokenized payment methods)
- Customer merge operations
- License plate mismatch detection

#### Club/Loyalty Program Endpoints
- Club enrollment (with proration options)
- Club tier management
- Membership renewal/suspension/termination
- Auto-billing (recurring credit card charges)
- Visit tracking and enforcement
- Cross-site usage data
- Advance expiration management

#### Fleet Account Endpoints
- Fleet account CRUD operations
- Department organization
- Vehicle assignment
- Prepaid account balance management
- Invoice generation
- ROA payment processing

#### Transaction/Financial Endpoints
- Transaction history
- Sales data by service/terminal
- Shift reports
- Credit card batch data
- Gift card operations
- Wash code generation/validation
- Discount/promotion application

#### Wash Operations Endpoints
- Wash initiation/queuing
- Gate control triggers
- Terminal status
- Equipment status monitoring
- Event history

#### Reporting Endpoints
- Cars washed (daily/weekly/annual)
- Revenue by service type
- Sales distribution
- Customer statistics
- RFID read statistics
- Performance metrics (VSPR)

---

## Known API Details

### CAGE API (Payment Processing)
This is ICS's **internal** payment API — not the same as the third-party integration API:
- Communicates between Auto Sentry terminal and card reader
- Handles EMV transaction flow
- Monitors transaction states and error codes
- Keeps cardholder data out of PA-DSS scope
- Not available to third parties

### WashConnect API (Third-Party Integration)
- **Technology**: Likely SOAP or REST over HTTPS (ASP.NET backend suggests both are possible)
- **Authentication**: Probably token-based or API key (login page shows privilege/entity-based access model)
- **Data Format**: Likely JSON (REST) or XML (SOAP)
- **Base URL Pattern**: Possibly follows `hosting1.washconnect.com/MyEco[SiteID]/api/` or similar
- **NO PUBLIC DOCUMENTATION EXISTS** — this is gated behind the $10K fee and NDA

### WashNOW App API
The customer-facing WashNOW app communicates with WashConnect. It likely uses:
- RESTful endpoints for customer account operations
- Purchase/transaction endpoints
- Membership management endpoints
- This is the closest analog to what UltrawashAPP would need

### WashConnect Mobile App API
The operator-facing mobile app accesses:
- Financial reports (cars washed, terminal balances, labor cost, sales distribution)
- Employee status (working/not working)
- Weather data (5-day forecast per site)
- Multi-site access (different customer numbers per location)
- Comparison data across date ranges

---

## Third-Party Integration Evidence

### Flower Press Interactive (CRITICAL INTELLIGENCE)
- **8+ years** integrating with ICS WashConnect
- Built the **Brown Bear Wash Club App** (60+ locations in Pacific Northwest)
  - React Native (iOS)
  - Custom API & Gateway back-end (middleware they built)
  - CRM integration with "limited API capabilities" — they had to build middleware to bridge gaps
  - Required the CRM provider (likely ICS) to "add new endpoints and updated permissions within their API"
  - Result: Doubled membership processing
- Also integrates with DRB, Washify, Micrologic, Sonny's, Eposnow
- **Key Insight**: Even with API access, Flower Press had to build custom middleware because the native API had "limited capabilities"

### Rinsed CRM Integration
- **Non-exclusive partnership** announced March 2023
- Rinsed integrates with ICS WashConnect, DRB SiteWatch, DRB Patheon, Sonny's, Micrologic, Washify, AMP
- Partnership **eliminates API access fees** for Rinsed customers
- Capabilities: Churn reduction, credit card decline handling, online sales optimization
- Marketing automation (email + text)
- Member usage pattern tracking
- **Key Insight**: ICS waived the API fee for Rinsed in exchange for a partnership that drives more customers to ICS hardware

---

## API Pricing Intelligence

### Known Fee Structure
- **ICS API Access**: ~$10,000 (as quoted to CEO)
- **Industry Norm**: Most car wash POS vendors charge API access fees
- **Exception**: Rinsed gets free API access through partnership
- **FlexWash**: Offers "free API access with every plan" as a competitive differentiator

### Negotiation Leverage
1. Rinsed gets free access — precedent exists for fee waiver
2. You're building a custom app that drives more wash volume (value to operator)
3. Flower Press has been doing this for 8 years — if they can, you can
4. The API apparently has "limited capabilities" — worth pushing back on $10K for something incomplete

---

## Alternative API Access Strategies

### Strategy 1: Partner Like Rinsed
- Propose a partnership similar to Rinsed's non-exclusive deal
- Pitch: UltrawashAPP drives membership growth, which means more revenue for the operator and more terminal transactions for ICS
- Ask for fee waiver or significant reduction

### Strategy 2: Piggyback on Rinsed
- If the wash uses Rinsed, integrate with Rinsed's API instead of ICS directly
- Rinsed already has the ICS data pipeline built
- May be simpler and cheaper

### Strategy 3: WashConnect Container Application
- Install WashConnect Container Application on a server you control
- This is the remote access version for "off-site employees to view reports and make changes"
- Could potentially extract data via screen scraping or database access
- Contact ICS Support at 1-800-246-3469 to request installation

### Strategy 4: Report Export Automation
- WashConnect supports "export functionality (multiple formats)"
- Set up automated report exports (likely CSV/Excel)
- Parse the exports programmatically
- Doesn't require API access — just WashConnect user credentials

### Strategy 5: Build Custom Middleware (Flower Press Model)
- Pay the $10K, get API access
- Build a middleware layer that enriches the "limited" native API
- Reuse this middleware for multiple car wash clients
- Amortize cost across clients ($10K / 10 clients = $1K each)

---

## What We DON'T Know (Gaps)

1. **Exact API endpoints and methods** — no public documentation
2. **Authentication mechanism** — token, API key, OAuth?
3. **Rate limits** — unknown
4. **Webhook support** — no evidence of push notifications from WashConnect
5. **Real-time vs batch** — does the API support real-time data or periodic syncs?
6. **Database schema** — SQL Server assumed but not confirmed
7. **Specific ports** — TCP ports for WashConnect services
8. **API versioning** — how stable are endpoints?
9. **Sandbox/test environment** — does ICS provide one?
10. **NDA requirements** — is the $10K tied to an NDA?
