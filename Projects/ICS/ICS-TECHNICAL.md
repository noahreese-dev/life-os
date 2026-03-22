# ICS Technical Specifications & Architecture

## System Architecture

### Network Topology

Based on installation documentation and manuals, the ICS system uses a **hub-and-spoke Ethernet network** at each car wash site:

```
                    [Internet/VPN]
                         |
              [WashConnect Server/POS PC]  ← ASP.NET, Windows OS
                   (Lobby Room)
                         |
                   [Network Switch]
                    /    |    \
                   /     |     \
    [Auto Sentry  [Tunnel Master  [Auto Passport
     Terminals]    WBC Controller]  RFID/LPR]
                         |
                    [RS-485 Bus]
                    /    |    \
              [Relays] [Sensors] [Keypad]
```

### Physical Layout (from ICS 2-Lane Installation Guide)
- **SERVER/POS COMPUTER**: Located in lobby room at entrance end of tunnel
- **MANAGEMENT/BACKUP SERVER**: Located in an office within the car wash
- All network components connected via **Ethernet** (Cat5e/Cat6)
- **RS-485** serial connections for legacy/field devices on tunnel controller

### IP Addressing
- **Tunnel Master WBC default IP**: 10.0.0.200
- Network accessed via web browser at the WBC IP address
- Suggests a **10.0.0.x** private network scheme for site-level devices

---

## WashConnect Technical Architecture

### Technology Stack
- **Backend**: ASP.NET (C#/.NET Framework, evidenced by .aspx pages)
- **Frontend**: jQuery-based web application
- **Hosting**: Windows Server (IIS implied)
- **Database**: SQL Server (implied by ASP.NET stack — not confirmed publicly)
- **Mobile**: Native iOS/Android apps
- **Desktop**: WashConnect Container Application (Windows, or VM on Mac/Linux)
- **Authentication**: Form-based with User ID + Password
- **Access Control**: Privilege-based, entity/site-scoped

### URL Structure
- Cloud-hosted instances: `hosting1.washconnect.com`, `host1000.washconnect.com`
- Path pattern: `/MyEco[SiteID]/Login.aspx`
- Web help: `host1000.washconnect.com/webhelp/[version]/`
- Versions observed: 1.4.11, 1.6.7, 1.7.4

### Login Page Hidden Fields (reveals internal architecture)
| Field | Purpose |
|-------|---------|
| `hidLocalEntityID` | Entity identifier (multi-entity support) |
| `hidConnectToCorp` | Corporate connection flag |
| `hidHF` | Host flag parameter |
| `hidPrivilegeID` | User privilege level |
| `hidMenuType` | Menu type identifier |
| `hidDefaultLogin` | Default login toggle |
| `hidDebug` | Debug mode flag |
| `hidLocalSiteID` | Site identifier |

### Desktop App Integration
- COM object integration via `window.external` for container app connectivity
- Container app version observed: v1.8.2.5
- Security: Right-click and Ctrl+F5 disabled in web interface
- Region/entity tree-based navigation for multi-site

### Data Replication
- Multi-site environments use **VPN connectivity**
- Data replication across sites for consolidated reporting
- Single-site and multi-site configuration supported

---

## Payment Terminal Technical Specs

### Auto Sentry Flex
- **Display**: Touchscreen (size not publicly specified, estimated 15-17")
- **Payment**: EMV chip, contactless NFC (13.56 MHz per ISO/IEC 14443), magnetic stripe
- **Cash**: Bill acceptor and bill dispenser
- **Network**: Ethernet connection to site network switch
- **Wiring**: All wiring home-run point-to-point (no splicing allowed)
- **Ground**: Mechanical ground lug in panel
- **Software**: CAGE API for payment processing
- **Video/Audio**: Built-in for upselling and advertising
- **Lifespan**: 12+ years reported by operators
- **Enclosure**: Outdoor-rated

### SmartStart Pro
- **Display**: 10.4" touchscreen
- **Payment**: Cashless (credit/debit, NFC)
- **Customization**: Decals, graphics, videos
- **Target**: Entry-level/affordable

### Auto Sentry Petro
- **Purpose**: Gas station express car wash lanes
- **Payment**: Cashless
- **Identification**: RFID or LPR (Auto Passport compatible)
- **Target**: Petroleum/C-store operators

---

## Tunnel Master WBC Controller

### Specifications
- **Interface**: Web-based (browser access)
- **Default IP**: 10.0.0.200
- **Network**: Ethernet (advanced two-way communication)
- **Serial**: RS-485 bus for field devices
- **Compatible Devices**: 16-digit entrance keypads, relay boards, sensors
- **CPU**: Main CPU board with RS-485 communication tiers
- **Features**:
  - Real-time equipment control and monitoring
  - Remote diagnostics and system updates
  - Web-based configuration
  - Entrance management to exit control
  - Gate control integration
  - Wash queuing

### Communication Protocols
- **Ethernet**: TCP/IP (specific ports not publicly documented)
- **RS-485**: Serial communication for tunnel equipment
- **Network 485**: Referenced as part of system architecture on main CPU board
- **HTTP/HTTPS**: Web browser access for monitoring and configuration

---

## Auto Passport Vehicle Identification

### RFID System
- **Technology**: Radio-Frequency Identification (RFID)
- **Form Factor**: Windshield decal/sticker
- **Reader**: Overhead-mounted at wash entrance
- **Process**:
  1. Pre-paid customer approaches gate
  2. Overhead Auto Passport receives RFID data from windshield decal
  3. Welcomes customer
  4. Asks for upgrade preferences
  5. Opens gate
  6. Queues wash

### AI-LPR System (New — 2025)
- **Technology**: Machine learning-powered license plate recognition
- **Accuracy**: Up to 99.9%
- **Hardware**: Camera-based (no costly camera hardware upgrades needed from existing RFID installations)
- **Capabilities**:
  - Automated club-member signup
  - Automated transaction processing
  - Usage pattern tracking
  - Buying/washing habit analysis
  - Contactless enrollment
  - No attendant involvement needed
- **Integration**: Direct with WashConnect for member management

---

## CAGE API (Payment Processing)

### Purpose
Proprietary software layer between the payment terminal and the card reader/processor.

### Technical Details
- Communicates directly to the card reader hardware
- Improves transaction flow and reduces errors
- Monitors progress states and error codes
- Provides real-time corrective commands to customer and card reader
- Keeps car wash out of PA-DSS scope
- No cardholder data ever exposed to the wash system's software
- Works with TransFirst (and potentially other processors)

### Security
- PCI DSS compliant
- EMV certified since 2014
- Card data never touches WashConnect — stays within CAGE/processor pipe

---

## Codax (PSD Codax) — Code Access System

### Overview
Acquired by ICS. Global leader in car wash code entry and access control.

### Capabilities
- Controls virtually all forecourt equipment:
  - Automatic carwashes
  - Self-serve bays/jet washes
  - Vacuums
  - Tire inflators
- Code-based access (numeric codes generated by POS)
- Integration with WashConnect ("Codax mapping" in WashConnect configuration)
- Marketing functionality
- Operational control
- Connectivity features

---

## Digital Menu Boards

### Specifications
- **Display Size**: 46"
- **Brightness**: Ultra-bright (sunlight readable)
- **Environmental**: Built-in temperature and humidity controls
- **Content**: Graphics, animations, HD video
- **Management**: Fully customizable content
- **Integration**: Direct with WashConnect
- **Purpose**: Menu display, upgrade promotion, gift card/club promotion

---

## Data Models (from WashConnect WebHelp v1.7.4)

### Customer Data
- Demographics and contact information
- Vehicle VIN and license plate data
- Membership tenure and status
- Transaction history
- Payment method details (Cards on File)
- Points and punch card counts
- Club visit counters
- PIN access credentials

### Financial Data
- Revenue by service type
- Journal entries with multi-step verification
- Shift details
- Credit card batch reconciliation
- Gift card balances
- Fleet account balances (prepaid with bonus structures)
- Commission data
- Deposit reconciliation
- Safe actions (deposits, withdrawals, currency conversion)

### Operational Data
- Device status and error codes
- Wash counts (daily, weekly, annual)
- RFID statistics and transaction reads
- InBay uptime
- Conveyor speed
- Employee clock-in/out times
- Event history with code search

### Report Export
- WashConnect supports **export functionality (multiple formats)** — exact formats (CSV, Excel, PDF) not documented publicly
- Print capabilities with layout control
- Date range selection with preset buttons

---

## Network Security Notes

- WashConnect web interface disables right-click and Ctrl+F5
- BeyondTrust Remote Support for ICS technician access
- VPN for multi-site data replication
- CAGE API isolates cardholder data from wash network
- EMV + PCI compliance throughout payment chain
- SSL encryption for cloud-hosted WashConnect instances
