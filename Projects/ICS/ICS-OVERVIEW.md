# ICS (Innovative Control Systems) — Complete Overview

## Company Background

**Innovative Control Systems, Inc. (ICS)** is the world-leading developer and provider of car wash technology solutions. Founded in **1988**, ICS specializes in the design and manufacture of car wash control systems, payment terminals (auto cashiers), and management software.

### Corporate Structure
- **Parent Company**: OPW Vehicle Wash Solutions (acquired ICS in January 2021)
- **Ultimate Parent**: Dover Corporation (NYSE: DOV) — a diversified global manufacturer
- **Sister Brands under OPW VWS**: PDQ Manufacturing, Belanger Inc.
- **Acquisition**: ICS acquired **PSD Codax, Ltd.** — the global leader in car wash code entry and access control systems
- **Headquarters**: Reportedly in Pennsylvania, USA
- **Support Line**: 1-800-246-3469
- **Website**: icscarwashsystems.com
- **Support Portal**: support.washnet.com
- **Help Center**: icscarwashsystemshelp.zendesk.com

---

## How ICS Systems Work (End-to-End)

### The ICS Ecosystem Architecture

```
[Customer arrives] → [Auto Passport RFID/LPR identifies vehicle]
        ↓
[Auto Sentry Payment Terminal] ← CAGE API → [Card Processor]
        ↓
[WashConnect POS/Server] ← Ethernet → [Tunnel Master WBC Controller]
        ↓                                        ↓
[WashConnect Cloud/Remote]              [Tunnel Equipment: rollers, brushes, dryers]
        ↓
[WashConnect Mobile App (operator)]
[WashNOW App (customer)]
[Digital Menu Boards]
```

### System Components (Layer by Layer)

#### 1. Vehicle Identification Layer
- **Auto Passport RFID**: Radio-frequency windshield decals, overhead reader identifies pre-paid customers automatically
- **Auto Passport LPR**: AI-powered License Plate Recognition with 99.9% accuracy, camera-based, no RFID tag needed
- **Codax**: Code entry access control system for forecourt equipment (carwashes, jet washes, vacuums, tire inflators)

#### 2. Payment Terminal Layer (Auto Sentry Family)

| Terminal | Type | Key Features |
|----------|------|-------------|
| **Auto Sentry Flex** | Full outdoor kiosk | Video/audio upselling, touchscreen, EMV/contactless, 12+ year lifespan reported |
| **Auto Sentry Flex HD** | Premium kiosk | High-definition display, enhanced video capabilities |
| **Auto Sentry CPT** | Payment terminal | Full-featured payment processing |
| **Auto Sentry Petro** | Gas station model | Cashless, RFID/LPR compatible, for express lanes at fuel stations |
| **SmartStart Pro** | Entry-level | 10.4" touchscreen, affordable, customizable decals/graphics/videos |
| **WashPad** | Indoor tablet terminal | Employee-facing, POS functionality |

All terminals support:
- Credit/debit cards (EMV chip + contactless/NFC)
- Fleet cards
- Loyalty program codes
- Wash codes (Codax)
- RFID identification
- LPR identification
- Gift cards
- Wash club memberships
- Cash (bill acceptor/dispenser on some models)

#### 3. Control Layer (Tunnel Master Family)

| Controller | Type | Key Features |
|-----------|------|-------------|
| **Tunnel Master WBC** | Web-based tunnel controller | Ethernet, RS-485, browser access at default IP 10.0.0.200 |
| **Tunnel Master Jr** | Compact tunnel controller | Simplified version for smaller operations |

The WBC controller:
- Manages tunnel operations from entrance to exit
- Two-way Ethernet communication
- RS-485 serial connections for legacy devices (e.g., 16-digit entrance keypads)
- Web browser interface for monitoring and configuration
- Remote diagnostics and system updates
- Real-time equipment status monitoring

#### 4. POS/Management Layer (WashConnect)

**WashConnect** is the central nervous system — a multi-site management and POS platform.

Key capabilities:
- Real-time financial, operational, and performance data
- Customer and fleet account management
- Club/loyalty program management with auto-billing
- Inventory management
- Employee management and time clock
- Commission tracking
- Marketing campaigns (email + SMS)
- 50+ report types (financial, operational, statistical)
- Multi-site data replication via VPN
- Accounting software interface
- Alert system (email notifications)

**Technical Architecture**:
- Built on **ASP.NET** (evidenced by .aspx login pages)
- Windows-based server (runs on Windows OS)
- Web-accessible via hosted instances (hosting1.washconnect.com, host1000.washconnect.com)
- URL structure: `/MyEco[SiteID]/` pattern
- jQuery frontend
- COM object integration for desktop app connectivity
- "Container Application" for remote access on personal PCs
- Hidden form fields reveal entity/site/privilege-based access model

#### 5. Customer-Facing Apps

| App | Purpose | Platform |
|-----|---------|----------|
| **WashNOW** | Customer mobile app for purchasing washes, washbooks, gift cards, clubs | iOS, Android |
| **WashConnect App** | Operator management portal (reports, monitoring) | iOS (61.6MB), Android |
| **WashTAB** | Tablet-based customer interface | Tablet |

**WashNOW** features:
- Secure password-protected customer accounts
- Purchase wash services anytime, anywhere
- Buy washbooks, gift cards, wash clubs
- Fully integrated with WashConnect for automatic syncing
- Contactless transactions

#### 6. Marketing & Display Layer

- **Digital Menu Boards**: 46" ultra-bright, sunlight-readable displays
  - Built-in temperature and humidity controls
  - HD video, animations, fully customizable
  - Promote upgrades, gift cards, club programs
- **The Agency at ICS**: In-house marketing division (website design, digital marketing, social media, reputation management)

#### 7. Payment Processing Layer

- **CAGE API**: ICS's proprietary software that communicates with the card reader
  - Keeps car wash out of PA-DSS scope
  - No cardholder data exposed to the wash system
  - Real-time corrective commands during transaction flow
  - Monitors progress states and error codes
  - Provides corrective action as necessary
  - Improves transaction success rate
- **TransFirst** integration for payment clearing
- **EMV compliant** since 2014
- Full PCI compliance

---

## Product Lines Summary

### Hardware
1. Auto Sentry Flex / Flex HD (outdoor payment kiosks)
2. Auto Sentry CPT (payment terminal)
3. Auto Sentry Petro (gas station terminal)
4. SmartStart Pro (entry-level terminal)
5. WashPad (indoor tablet terminal)
6. Auto Passport RFID (windshield tag readers)
7. Auto Passport LPR (AI camera-based plate recognition)
8. Tunnel Master WBC (web-based tunnel controller)
9. Tunnel Master Jr (compact controller)
10. Digital Menu Boards (46" outdoor displays)
11. Codax (code entry access control)
12. Entrance/Exit Management System (gates, sensors, access logic)

### Software
1. WashConnect (multi-site POS and management)
2. WashNOW (customer mobile app)
3. WashConnect Mobile App (operator app)
4. WashTAB (tablet interface)
5. CAGE API (payment processing software)
6. Tunnel Master firmware

### Services
1. The Agency at ICS (marketing services)
2. Technical support (phone, email, chat, text)
3. Remote support (BeyondTrust-powered)
4. E-learning training center
5. Documentation center
6. Installation and configuration services

---

## Market Position

- **Industry leader** in car wash payment terminals and POS
- Competitors: DRB Systems (SiteWatch/Patheon), Washify, Micrologic, Sonny's, Washlink Systems, Unitec, KesselTronics
- **3rd-party CRM partners**: Rinsed (official partnership), Flower Press Interactive (custom development)
- **Scale**: Serves single-site operators to large chains
- Part of Dover Corporation's $7B+ portfolio

---

## Key Partnerships

| Partner | Nature | Details |
|---------|--------|---------|
| **Rinsed** | CRM integration | Non-exclusive partnership (March 2023). Eliminates API access fees. Reduces churn, increases online sales. |
| **Flower Press Interactive** | Custom app development | Builds custom iOS/Android apps that integrate with WashConnect API. Built Brown Bear Wash Club App. |
| **TransFirst** | Payment processing | Credit card clearing partner |
| **PSD Codax** | Acquired subsidiary | Code entry and access control systems |

---

## Documentation Available

ICS maintains a documentation library with:
- Brochures
- Cut Sheets
- Installation Guides
- Instruction Sheets
- User Manuals
- Quick Reference Guides
- Release Notes
- Technical Briefs
- Videos
- "What's New" files
- E-learning courses (maintenance PDFs and videos)

Most documentation is behind their customer portal or requires contacting support. The Zendesk help center (icscarwashsystemshelp.zendesk.com) returns 403 errors for unauthenticated users, suggesting gated content.
