# Hardware Ad + — Codebase & Project Assessment

> Assessed: 2026-02-08
> Location: C:\Users\Pc\Desktop\HardwareP

## NOT Starting From Scratch — Heavily Developed

This is the most thoroughly documented project in the Life-OS. The product is the **WTR MAX "Sovereign Cloud"** — a NAS/workstation designed for local AI agents, built by Hotus Technology (Shenzhen). The deliverable is a **Kickstarter campaign video**.

## The Product: WTR MAX / Sovereign Cloud
- AMD R7 PRO 8845HS (Zen 4, 8C/16T, 5nm, NPU)
- 11 drive bays (5x M.2 + 6x SATA) — up to ~100TB
- DDR5 5600MHz ECC
- OCulink (~63 Gbps) + USB4 (40 Gbps) — future GPU expansion
- 2x 2.5G Ethernet + 2x SFP+ (10G fiber-ready)
- 35W TDP, always-on, active cooling
- ~$600 price point
- Manufacturer: Hotus Technology, Shenzhen

## The Deliverable: Kickstarter Video (2:30–3:00)

### Two-Part Structure
1. **Part 1: "What Is It?"** (~1:30–2:00) — Cinematic manifesto. Male/female dialogue. Philosophical → practical. "Own Your Shadow."
2. **Part 2: "Meet Your AI"** (~1:00–1:30) — Organic demo of the local AI agent running on the hardware. Authentic, filmed style.

### Narrative: "Ground the Cloud"
- Enemy: Big Tech cloud landlords (Google, AWS, Apple)
- Truth: You're renting your digital identity for ~$0/month but at the cost of sovereignty
- Solution: Own your infrastructure for $600. Private vault + personal AI + agentic OS

## Tech Stack (Video Production)
- **Remotion** — Programmatic video composition (React-based)
- **ElevenLabs** — AI voice generation (male narrator + female questioner)
- Multiple render scripts for different drafts and voice combos

## What Exists

### Documentation (Excellent)
- `MASTER_PLAN.md` — Comprehensive north star document
- `CREATIVE_BRIEF.md` — Full creative direction, tone, visual direction
- `ICP_PROFILE.md` — Detailed ideal customer profile
- `PROJECT_CONTEXT.md` — Product overview
- `TECHNICAL_PLAN.md` — Remotion/audio pipeline
- `VOICE_OPTIONS.md` — Voice selection notes

### Scripts (18+ versions written)
- `SCRIPT_v1` through `SCRIPT_v18` — Massive iteration on copy
- Best bases identified: v11 (vault/identity) + v5 (freedom/practical)
- Scripts cover different angles: ground, shadow, rent, hold, freedom, home, memories, vault, frozen, github, legacy, agent, rest

### Audio (Generated)
- ElevenLabs voiceovers generated across multiple drafts
- Music track selected ("MANA")
- Audio generation scripts built (generate-audio.js, render-draft17-*.js)

### Video Renders (4+ drafts)
- `draft13-idea-builder.mp4` (45MB)
- `draft14-refined.mp4` (32MB)
- Earlier versions: v1, v10
- Remotion compositions exist for horizontal + vertical formats

### Visual Assets
- Product hero shots (white bg + dark cinematic)
- Real product photos (aluminum finish)
- WhatsApp images from manufacturer
- Product videos from manufacturer
- Philosophy presentation deck

## What's NOT Done

### Per the MASTER_PLAN execution sequence:
- [ ] Lock the first-half script (Draft 2 iteration)
- [ ] Generate final audio with locked script
- [ ] Get forced alignment timestamps
- [ ] Build final Remotion scene map synced to audio
- [ ] Write second-half script (organic AI demo)
- [ ] Film supplementary footage (requires hardware setup)
- [ ] Full audio mix (voiceover + music + SFX)
- [ ] Vertical social media cuts
- [ ] Kickstarter page build

### Open Questions (from MASTER_PLAN)
1. Brand name: "Sovereign Cloud" vs "WTR MAX"?
2. AI character name: "Ashley" or unnamed?
3. Hardware setup timeline for Part 2 filming?
4. Additional music for Part 2?
5. Kickstarter launch date?

## Timeline
- **Deadline**: 1-2 weeks
- **Current state**: Draft 14+ of video, extensive scripts and audio. Close to final but needs script lock and polish.

## Immediate Next Steps
1. **Lock the script** — Pick the best draft, finalize the dialogue
2. **Generate final audio** — ElevenLabs with locked script, proper voice combos
3. **Sync Remotion** — Map audio timestamps to visual scenes
4. **Render final horizontal** — 1920x1080 Kickstarter hero video
5. **Cut vertical** — 1080x1920 for social media
6. **Answer open questions** — Brand name, launch date, Part 2 plan
