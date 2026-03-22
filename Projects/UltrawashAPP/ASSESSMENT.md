# UltrawashAPP — Codebase Assessment

> Assessed: 2026-02-08
> Location: C:\Users\Pc\Downloads\UltrawashApp

## NOT Starting From Scratch — Phase 1 Complete

This is a well-developed Expo React Native app with a clear roadmap and extensive planning already done.

## Tech Stack
- **Framework**: Expo SDK 54 + React Native 0.79
- **Routing**: Expo Router (file-based, tabs layout)
- **Styling**: NativeWind (Tailwind for RN) v4
- **State**: Zustand (local) + React Query (server/async)
- **Animation**: React Native Reanimated v3 + Gesture Handler
- **Icons**: Lucide React Native
- **Fonts**: DM Sans + Outfit + Playfair Display
- **Charts**: Victory Native
- **Built with**: Vibecode (has @vibecodeapp/sdk)

## App Structure

### Screens/Routes (12+)
**Tab screens:**
- `(tabs)/index.tsx` — Home
- `(tabs)/shop.tsx` — Service shop
- `(tabs)/washes.tsx` — My washes
- `(tabs)/rewards.tsx` — Rewards/loyalty
- `(tabs)/games.tsx` — Games section
- `(tabs)/profile.tsx` — User profile

**Stack screens:**
- `cart.tsx` — Cart/checkout
- `wash-detail.tsx` — Individual wash detail + QR display
- `spin-wheel.tsx` — Spin the wheel game
- `word-wash.tsx` — Word puzzle game
- `login.tsx` / `sign-up.tsx` / `forgot-password.tsx` — Auth flow

### Components
- `Hero3DCar.tsx` — 3D animated car hero
- `ServiceCard.tsx` — Service listing cards
- `GlassCard.tsx` — Glassmorphism card component
- `AnimatedPressable.tsx` — Animated button
- `Confetti.tsx` — Celebration animation
- `Skeleton.tsx` — Loading skeletons

### Data/State
- `store.ts` — Zustand store with persistence
- `types.ts` — Full TypeScript type system (services, washes, memberships)
- `data.ts` — Mock data
- `theme.ts` — Theme system (Dark/Light/Blue)
- `word-puzzles.ts` — Word game data

## What's DONE (Phase 1 - Complete)
- [x] Core app structure (Expo Router, tabs)
- [x] Theme system (Dark/Light/Blue)
- [x] Services catalog with categories
- [x] Cart and checkout flow (mock)
- [x] Loyalty points & tier system
- [x] QR code generation (visual only, not scannable)
- [x] User authentication UI
- [x] Profile & settings screens
- [x] 3D animated hero car
- [x] Spin the wheel game
- [x] Word wash game

## What's IN PROGRESS (Phase 2)
- Games & engagement section (partially built)
- Points economy balancing

## What's NOT DONE YET

### Phase 3: Backend & Data
- No real backend (everything is mock/local)
- No real authentication
- No data persistence across devices
- Backend choice not finalized (Firebase vs Supabase)

### Phase 4: Kiosk Integration (ICS + Liquid Barcodes)
- Extensive research DONE (see ics-gameplan.md)
- Architecture planned: App -> Liquid Barcodes API -> ICS Kiosk
- **BLOCKER**: Need to contact Liquid Barcodes for API credentials
- QR codes are visual-only, need real scannable codes

### Phase 5: Payments & Subscriptions
- Moneris integration planned (Canadian market)
- Payment flow is mocked

### Phase 6: Polish & Launch
- App Store preparation
- Performance optimization

## Key Insight: The ICS Gameplan

There's a detailed, verified integration plan (`ics-gameplan.md`) that maps out exactly how to connect the app to the car wash kiosks via Liquid Barcodes middleware. The architecture is:

```
UltrawashApp -> Liquid Barcodes API -> ICS Kiosk (AutoSentry)
```

**Business blocker**: Need to email sales@liquidbarcodes.com to get API credentials before the kiosk integration can proceed.

## Immediate Next Steps
1. **Business action**: Contact Liquid Barcodes for API access
2. **Backend setup**: Stand up Supabase for real user data, purchases, points
3. **Real QR codes**: Replace procedural SVGs with scannable barcodes
4. **Games polish**: Complete the games section (daily streaks, scratch cards)
5. **Payment integration**: Wire up Moneris or Stripe

## What Can Be Built NOW (While Waiting on Liquid Barcodes)
- Backend infrastructure (Supabase)
- Complete games section
- Real payment processing
- Push notifications
- UI/UX polish pass
