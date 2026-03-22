# UltrawashAPP — Car Wash Loyalty & Points Mobile App

## What It Is
Mobile app for **Ultra Wash+** car wash (Nebo Road, Hamilton, Canada) to manage their loyalty points system, bookings, and subscriptions. Replaces the client's current manual/outdated systems with a gamified, premium mobile experience.

## Core Functionality
- Loyalty points & tier system (earn/redeem)
- Service shop with cart and checkout
- QR code generation for kiosk scanning
- Games section (spin wheel, word puzzles, daily streaks)
- User profiles with wash history
- Subscription management
- 3D animated hero car

## Priority & Status
- FUNDED: High-priority with immediate deadline
- Phase 1 UI: COMPLETE (12+ screens, all mock data)
- Phase 2 (Games): Partially complete
- Phase 3+ (Backend, Kiosk, Payments): NOT STARTED
- BLOCKER: Need Liquid Barcodes API credentials for kiosk integration

## Codebase
- Location: `C:\Users\Pc\Downloads\UltrawashApp`
- Stack: Expo SDK 54 + React Native 0.79 + NativeWind + Zustand + React Query
- Built with Vibecode initially, now maintained directly
- Has detailed integration plan: `ics-gameplan.md`

## Key Technical Notes
- Kiosk integration: App → Liquid Barcodes API → ICS AutoSentry kiosk
- Payment: Moneris preferred (Canadian market)
- Backend: Supabase planned (not yet set up)
- QR codes currently visual-only, need real scannable barcodes
- Contact sales@liquidbarcodes.com for API access (business blocker)
