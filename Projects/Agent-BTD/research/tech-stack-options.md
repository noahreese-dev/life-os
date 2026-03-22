# Agent BTD — Tech Stack Evaluation

> Generated: Feb 24, 2026

## Recommended Build Path

| Phase | Stack | Why |
|-------|-------|-----|
| **Phase 1 (Static Map)** | **Vanilla HTML + Phaser.js CDN** | /calendar pattern, zero friction |
| **Phase 2 (Live Game)** | **React + Phaser.js + Node.js WebSocket** | Real-time JSONL monitoring |
| **Phase 3 (Interactive)** | **Same + Tauri wrapper** | Desktop distribution, filesystem access |
| **Phase 4 (Product)** | **Consider Godot** | If it grows beyond a personal tool |

## The Options

### Option A: Vanilla HTML + Phaser.js via CDN — RECOMMENDED for Phase 1
- **Pros**: Zero build step, proven /calendar pattern, Phaser has TD-specific features (path following, tower placement, wave systems), opens in any browser, Claude Code can generate it as a skill output
- **Cons**: Static snapshot (no real-time without server), large CDN dependency, no filesystem access from browser
- **Verdict**: Best starting point. Matches Phase 1 roadmap exactly. Lowest friction.

### Option B: React + Phaser.js — RECOMMENDED for Phase 2+
- **Pros**: Full interactivity, React handles panels/menus while Phaser handles game canvas, can add WebSocket for real-time JSONL monitoring, hot reload
- **Cons**: Requires build tooling (Vite), more setup, needs a local server
- **Verdict**: Best for real-time version.

### Option C: Go + Raylib (Claude Quest's stack)
- **Pros**: Proven by Claude Quest, single binary, real sprite rendering, native file watching via fsnotify
- **Cons**: Go is not in Noah's current stack, Raylib learning curve, separate window (not browser)
- **Verdict**: Good reference, not recommended as primary. Fork Claude Quest for JSONL parsing code.

### Option D: Godot (ccworkspace's stack)
- **Pros**: Purpose-built for games, best visual quality potential, tilemap editor, export to web/desktop/mobile
- **Cons**: Steepest learning curve, GDScript is new, hardest to integrate with markdown data
- **Verdict**: Best for standalone product (Phase 4+). Not for v0.

### Option E: Python + Textual TUI
- **Pros**: Fast to prototype, Python ecosystem, CSS-styled terminal
- **Cons**: Text-based only, no sprites, no game-like visuals, terminal only
- **Verdict**: Good for monitoring dashboard, not for BTD visuals.

### Option F: Tauri (Rust + web frontend)
- **Pros**: Small binary, filesystem access, web frontend, cross-platform
- **Cons**: Rust backend learning curve, overkill for v0
- **Verdict**: Best for Phase 3 distribution. Package React+Phaser as desktop binary.

## Why Phaser.js

Phaser.js is the recommended game rendering library because:
1. Proven for tower defense games (many existing TD examples)
2. Built-in systems for: path following (bezier curves), sprite animation, tile maps, particle effects, physics, audio
3. Loadable via CDN (no build step for Phase 1)
4. Embeddable in React for Phase 2+
5. Large community with TD-specific tutorials
6. Web-based = runs alongside Claude Code without separate window
7. Exportable to mobile via Capacitor if needed later

## Data Flow Architecture

```
Phase 1 (Static):
  STATUS.md + WEEKLY-LOG.md → parser script → agent-btd.html (Phaser CDN)

Phase 2 (Real-time):
  JSONL logs → Node.js watcher → WebSocket → Browser (React + Phaser)
  STATUS.md → File watcher → Same WebSocket → Same browser

Phase 3 (Desktop):
  Same as Phase 2, wrapped in Tauri
  Tauri's Rust backend handles file watching natively
```
