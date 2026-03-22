# Agent BTD — Comprehensive Code Audit

**Auditor**: Claude Opus 4.6 (Continuous Improvement Agent)
**Date**: 2026-03-14
**Codebase Version**: Commit `1bc6826` (overnight visual overhaul)
**Scope**: Full codebase — game engine, bridge layer, tests, philosophy, project structure

---

## Executive Summary

Agent BTD is a 3522-line single-file tower defense game with a WebSocket bridge layer and Playwright test suite. The game is visually polished with procedural audio, AI auto-play, a combo system, and 12 unique tower types. The architecture is sound for a prototype but has several bugs, performance concerns, and missing robustness that should be addressed before the next phase (WebSocket bridge integration).

**Test Baseline**: 6/6 Playwright tests passing (1.7 minutes).

---

## Issues Found

### CRITICAL (Game-Breaking)

#### C1. `darkenColor()` crashes on non-hex color values
**File**: `game/index.html` line 1378
**Issue**: `darkenColor()` uses `hex.slice(1,3)` etc. but does not guard against non-hex inputs. The `rainbow` balloon type has `color:'rainbow'` (a string, not a hex code). While `lightenColor()` has a guard (`if (hex === 'rainbow') return '#ffcc66'`), `darkenColor()` does NOT. This means any code path that calls `darkenColor` on a rainbow balloon will produce `NaN` values and a broken color string `#NaNNaNNaN`.

**Impact**: The balloon knot drawing at line 1513 calls `darkenColor(def.color, 25)` when `def.color` is `'rainbow'`. Currently masked by conditional logic checking `def.color === 'rainbow'` on line 1513, but the ternary still evaluates `darkenColor('rainbow', 25)` in the false branch of a different check — fragile.

**Fix**: Add rainbow guard to `darkenColor()`.

#### C2. `_leaderBoosted` flag is cleared before it's used for range
**File**: `game/index.html` lines 2156-2173
**Issue**: The CoS leadership aura sets `ot._leaderBoosted = true` for nearby towers (line 2160), but in the same tower loop iteration, the flag is immediately cleared at line 2167 (`tower._leaderBoosted = false`). The `effectiveRange` calculation at line 2173 uses `tower._leaderBoosted` which was already cleared to false. This means **the CoS leadership aura range boost never actually applies**.

**Fix**: Clear the flag AFTER using it for the effective range calculation, or use a separate timing mechanism.

#### C3. Ali Berserker kill tracking counts ALL towers of the same type
**File**: `game/index.html` lines 2396-2399
**Issue**: When a projectile kills a balloon, the code iterates ALL towers and increments kills for every tower matching the projectile's `towerType`. If you have 3 Ali towers, popping one balloon increments kills on ALL 3 Ali towers. This makes the Berserker ability trigger far too easily with multiple Ali towers and misattributes kill credit.

**Fix**: Track the specific tower instance that fired the projectile, not just the type.

### HIGH (Significant Bugs / Missing Functionality)

#### H1. WebSocket bridge `sendWsFrame` doesn't handle payloads > 65535 bytes
**File**: `bridge/server.js` line 115
**Issue**: The frame encoding only handles `payloadLength <= 125` and `payloadLength <= 65535` (126 extended). For payloads over 65535 bytes (which can happen with large Claude Code streaming responses), the 127 extended payload length is not implemented. The buffer allocation will be wrong, causing corrupt frames.

**Fix**: Add 127 (8-byte) payload length handling.

#### H2. Save/Load does not persist `cashEarned` or `bestCombo`
**File**: `game/index.html` lines 2919-2936
**Issue**: `cashEarned` and `bestCombo` are tracked in game state but not serialized in `saveGame()`. After reload, the game-over stats screen will show 0 for these even if the player earned thousands.

**Fix**: Include `cashEarned` and `bestCombo` in save data, restore them in `loadGame()`.

#### H3. Clone button charges full price but doesn't validate affordability
**File**: `game/index.html` lines 3434-3453
**Issue**: The clone button calls `placeTower()` which charges `def.cost`, but there's no upfront check that the player can afford it. If `state.cash < def.cost`, the internal `placeTower` guard will silently fail, leaving the user with no feedback. Also, the clone gets `level - 1` but retains the base tower stats (not the leveled-up stats), which is inconsistent with the level display.

**Fix**: Add affordability check with user feedback. Recalculate stats for the clone's level.

#### H4. Teleport mode has no visual indicator or cancel mechanism
**File**: `game/index.html` lines 3012-3023, 3456-3461
**Issue**: When teleport mode is active, there's no cursor change, no range preview, and no clear way for the user to cancel (pressing Escape doesn't check for teleport state). Clicking an invalid spot silently cancels teleport mode with no feedback.

**Fix**: Add visual indicator, handle Escape to cancel, show feedback on invalid placement.

#### H5. `isOnPath` only checks point proximity, not segment proximity
**File**: `game/index.html` lines 473-481
**Issue**: The path collision check only tests distance to individual path points (sampled at `pathPoints[i]`), not to the line segments between them. With 16 segments per waypoint from Catmull-Rom, the gaps are small, but there are still positions between sampled points where towers could be placed ON the path, especially at straight sections with sparse samples.

**Fix**: Replace with proper point-to-line-segment distance calculation, or increase sample density check.

### MEDIUM (Polish / Balance / Quality)

#### M1. Round progress bar calculation is incorrect
**File**: `game/index.html` lines 2836-2843
**Issue**: The progress bar formula `spawned * alive * 100` where `alive = 0.5 if balloons > 0 else 1` means progress can never exceed 50% while balloons are alive. It should show spawn progress independently, then completion when all balloons are popped.

#### M2. Music system oscillators accumulate if start/stop is toggled repeatedly
**File**: `game/index.html` lines 673-698
**Issue**: Each call to `start()` creates 6 new oscillators (3 pad + 3 LFO). `stop()` clears the array, but if `start()` is called without `stop()`, the check `if (this.isPlaying) return` guards against this. However, calling stop then start rapidly could create audio artifacts because the old oscillators may not have fully stopped.

#### M3. AI controller never sells underperforming towers
**Issue**: The AI only sells farms in panic mode. A level-0 Daily-Ops tower in a dead zone provides nearly zero value but costs a placement slot. The AI should evaluate tower effectiveness and sell low-performers to fund upgrades.

#### M4. No purple/black/white balloon immunities
**Issue**: In BTD6, purple balloons are immune to energy attacks, black to explosions, white to freezing. Agent BTD has these balloon types but no immunity mechanics, reducing strategic depth for tower selection.

#### M5. Health tower `regenTimer` counts with `adt` (adjusted delta) instead of real time
**File**: `game/index.html` line 2152
**Issue**: The health tower's regen timer uses `adt` (which includes game speed), meaning at 3x speed, health regenerates 3x faster. The description says "+1 life/30s" but it's actually 30 game-seconds, not real-seconds. This is arguably intentional but should be documented.

#### M6. Wave generation uses `Math.random()` making game non-deterministic
**Issue**: Wave composition, balloon delays, and AI decisions all use `Math.random()`. This makes testing, replay, and debugging difficult. A seeded PRNG would enable reproducible games and deterministic testing.

#### M7. Particle and floating text arrays can grow unbounded during intense battles
**Issue**: There's no cap on `state.particles` or `state.floatingTexts`. During late-game waves with many pops (especially MOAB cascades spawning dozens of children), thousands of particles can accumulate, causing frame drops.

#### M8. `package.json` test script is a placeholder
**File**: `package.json` line 10
**Issue**: `"test": "echo \"Error: no test specified\" && exit 1"` should be `"test": "npx playwright test"`.

### LOW (Minor / Cosmetic)

#### L1. Missing `lightenColor` guard in `darkenColor` for 'rainbow'
Related to C1 above. Cosmetic in current usage but an API inconsistency.

#### L2. `origClick` variable defined but never used
**File**: `game/index.html` line 3464
**Issue**: `const origClick = handleCanvasClick;` is assigned but never referenced anywhere.

#### L3. Bridge server uses `SIGTERM` on Windows
**File**: `bridge/server.js` lines 182-193, `bridge/session-manager.js` line 115
**Issue**: `SIGTERM` is not natively supported on Windows. The `process.kill('SIGTERM')` call may not properly terminate child processes. Should use `process.kill('SIGINT')` or `taskkill` on Windows.

#### L4. No favicon or PWA manifest
**Issue**: Browser tab shows default icon. A small favicon matching the crown monkey would improve browser identification.

#### L5. `balloon.id` uses `Math.random()` which can theoretically collide
**File**: `game/index.html` line 2321
**Issue**: `id: Math.random()` for balloon identity. Low collision probability but not zero. Could use incrementing counter instead.

#### L6. Targeting popup doesn't dismiss when clicking canvas
**Issue**: The popup dismiss listener is on `document` click (line 3429), which fires after canvas click. The popup closes but may interfere with tower placement in the same click.

#### L7. `updateWavePreview` regenerates next wave every time called
**File**: `game/index.html` lines 2037-2061
**Issue**: `generateWave(state.round + 1)` is called every time wave preview updates. Since waves use `Math.random()`, the preview changes each time it's rendered, showing inconsistent compositions.

---

## Performance Analysis

### Render Loop (`render()` function)

| Item | Concern | Severity |
|------|---------|----------|
| Background drawn from cached canvas | Good — `bgCanvas` is pre-rendered | None |
| Water shimmer: 8 ellipses per frame | Fine at 8 | Low |
| Ambient motes: 30 particles per frame | Negligible | None |
| Path wear marks: full path re-drawn per frame | Could be cached on `bgCanvas` | Low |
| Cloud rendering: 4 clouds, 3 ellipses each | Fine | None |
| Minimap: full re-render every frame | Could be throttled to every 5th frame | Low |
| `getPointAtDistance()`: Linear scan each call | Called per balloon per tower per frame for targeting | Medium |
| Particle additive blending: composite mode switch | Can cause GPU pipeline stalls | Low |

### Update Loop (`update()` function)

| Item | Concern | Severity |
|------|---------|----------|
| Tower targeting: O(towers * balloons) per frame | Fine for < 50 towers, < 200 balloons | Low |
| `getPointAtDistance()` in targeting: linear search | Could be optimized with binary search on `pathDistances` | Medium |
| CoS leadership aura: nested O(towers^2) per frame | With many towers, this gets expensive | Medium |
| AI tick: grid sampling 45px step over 1600x900 | ~700 positions evaluated per AI tick (1.2s interval) | Low |
| Projectile trail tracking: push/shift per frame | Array shift is O(n) but n=5, negligible | None |

### Recommended Performance Optimizations (Priority Order)

1. **Binary search in `getPointAtDistance()`** — currently linear scan of all path points. With ~300 points, this is called hundreds of times per frame. Binary search on the sorted `pathDistances` array would reduce to O(log n).
2. **Cache path coverage per cell** — pre-compute a grid of "how much path is within range R" to speed up AI position scoring.
3. **Cap particle arrays** — limit to 200 particles and 20 floating texts. Drop oldest when cap exceeded.
4. **Throttle minimap** — render every 3rd frame instead of every frame.
5. **Move path wear marks to background canvas** — it's a static decoration, no reason to redraw per frame.

---

## Gameplay Balance Assessment

### Tower Economy

| Tower | Cost | DPS (dmg/rate) | DPS/$ | Verdict |
|-------|------|----------------|-------|---------|
| Daily-Ops | $200 | 0.83 | 0.0042 | Good early tower |
| Ultra | $300 | 0.50 | 0.0017 | Weak DPS but rapid fire ability compensates |
| Hassan | $350 | 2.00 | 0.0057 | Slow utility, not DPS |
| Meta | $350 | 2.00 | 0.0057 | Decent |
| Social | $350 | 0.67 | 0.0019 | Weak — needs buff or special ability |
| Health | $400 | 2.50 | 0.0063 | Utility via regen |
| Jung | $400 | 2.50 | 0.0063 | Good + mind control |
| Garage | $450 | 8.00 | 0.0178 | Very strong — pierce makes it best value |
| Ali | $500 | 8.33 | 0.0167 | Strong + berserker |
| Telegram | $600 | 0 (farm) | $70/round income | Pays for itself in 9 rounds |
| IM Web | $700 | 0.40 | 0.0006 | Extremely weak — chain lightning helps but DPS is terrible |
| CoS | $800 | 3.00 | 0.0038 | Expensive but leadership aura (currently broken) justifies |

### Balance Issues

1. **IM Web is severely underpowered**: At $700 for 0.4 base DPS, it's the worst DPS/$ in the game by a factor of 30x. Chain lightning (0.6x damage to 2 targets) helps but not enough. Needs either higher base damage, lower cost, or stronger ability.

2. **Garage33 is overpowered**: Pierce (3 balloons) + 4 damage + 200 range makes it the best tower by far. The AI should favor it more.

3. **SocialStar has no special ability**: Every tower except SocialStar, Daily-Ops, Meta, and Telegram has a defined ability in `TOWER_ABILITIES`. SocialStar is described as "rapid fire" in the philosophy doc but has no ability entry.

4. **Telegram pays back too slowly in early game**: At $600 and $70/round income, it takes 8.6 rounds to break even. With base round income of $100+round, the farm only provides 40-70% bonus. Viable but the AI places it too early.

5. **Upgrade scaling is linear**: Each upgrade adds +1 damage flatly. For expensive towers (CoS, IM), this means upgrades are less impactful proportionally. Upgrades should scale with the tower's base stats.

---

## Bridge Layer Assessment

### Architecture
The bridge is well-structured with clean separation:
- `server.js` — WebSocket protocol + message routing
- `session-manager.js` — Claude Code process lifecycle
- `tower-agent-map.js` — tower-to-agent mapping

### Issues

1. **No heartbeat/ping-pong** — If a client connection drops silently (network timeout), the server won't detect it. Stale connections accumulate in `clients` Set.

2. **No message queuing** — If Claude Code produces output while no clients are connected, events are lost. A small event buffer per agent would prevent data loss during reconnections.

3. **`stdin.write` has no backpressure** — `session-manager.js` line 107 writes to stdin without checking if the write buffer is full. For large prompts, this could cause issues.

4. **No Windows-specific process cleanup** — `SIGTERM` doesn't work reliably on Windows. Should use `process.kill()` with `SIGINT` or the `taskkill` command for Windows compatibility.

5. **Session manager doesn't track multiple simultaneous sessions well** — `agentId` is the key, but there's no way to have two instances of the same tower type with different agent IDs. The game could clone a tower but the bridge wouldn't know how to distinguish them.

6. **No reconnection logic** — If the bridge server restarts, game sessions are lost. The bridge should persist session metadata and attempt recovery.

### What's Good
- Manual WebSocket implementation avoids `ws` dependency — good for minimal footprint
- Token authentication is present
- Graceful shutdown handlers exist
- Clean event-based architecture with EventEmitter
- NDJSON stream parsing handles partial lines correctly

---

## Test Coverage Assessment

### Current Coverage (6 tests)
1. Game loads and renders canvas -- Basic smoke test
2. Tower placement via API -- Tests placeTowerAt
3. Wave sends and balloons appear -- Tests startWave
4. AI auto-play survives 3+ waves -- Integration test of AI
5. Balloon teardrop rendering -- Visual sanity check
6. Combo system on rapid pops -- Tests pop counting

### Missing Test Coverage

| Scenario | Priority | Why |
|----------|----------|-----|
| **Targeting modes** (first/last/strong/close) | High | Core gameplay feature, untested |
| **Clone agent** button functionality | High | New feature, untested |
| **Teleport** button functionality | High | New feature, untested |
| **Music system** toggle and mode transitions | Medium | Audio system untested |
| **Game over screen** and retry | High | Critical flow untested |
| **Tower upgrade** mechanics | Medium | Economy untested |
| **Tower sell** mechanics | Medium | Economy untested |
| **Save/Load** persistence | Medium | Data integrity untested |
| **Balloon children spawning** (pop cascade) | Medium | Core mechanic untested |
| **MOAB/BFB** blimp mechanics | Medium | Late-game untested |
| **Speed controls** (1x/2x/3x) | Low | Simple UI untested |
| **Right-click targeting popup** | Low | UI interaction untested |
| **Keyboard shortcuts** (space, 1/2/3, Escape) | Low | Input untested |
| **Offline income** calculation | Low | Edge case untested |
| **Path collision** for tower placement | Medium | Placement validation untested |

---

## Recommended Next Steps (Priority Order)

### Immediate (This Session)
1. **Fix C1**: Add rainbow guard to `darkenColor()` -- 1 line
2. **Fix C2**: CoS leadership aura flag timing -- 5 lines
3. **Fix C3**: Track tower instance on projectiles instead of type -- 10 lines
4. **Fix L2**: Remove unused `origClick` variable -- 1 line
5. **Fix M8**: Update package.json test script -- 1 line
6. **Add tests**: Targeting modes, game over + retry, clone/teleport, music toggle

### Short-Term (Next Session)
7. **Fix H1**: Bridge WebSocket large payload handling
8. **Fix H2**: Save/load completeness
9. **Fix H3**: Clone affordability and stats
10. **Fix H4**: Teleport visual indicator
11. **Performance**: Binary search in `getPointAtDistance`
12. **Performance**: Cap particle arrays
13. **Balance**: Buff IM Web, add SocialStar ability

### Medium-Term (Next Sprint)
14. **Balance**: Balloon immunities (purple/black/white)
15. **Bridge**: Add heartbeat, message queuing, Windows process cleanup
16. **Architecture**: Extract game state management into separate module
17. **Architecture**: Seeded PRNG for deterministic games
18. **Feature**: Keyboard shortcut for tower selection (1-9 keys)
19. **Feature**: Wave preview shows actual upcoming wave (not re-randomized)

### Long-Term (Vision)
20. **Bridge integration**: Connect game towers to real Claude Code sessions
21. **Thought bubbles**: Display AI reasoning above monkeys
22. **Real task balloons**: Ingest from GitHub/Gmail/Calendar
23. **Performance metrics**: Real productivity scoring
24. **Living map**: Dynamic path layout from project topology

---

## Code Quality Score

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 7/10 | Clean single-file for prototype, needs modularization for growth |
| Correctness | 6/10 | 3 critical bugs found, several medium bugs |
| Performance | 7/10 | Adequate for current scale, a few O(n) loops to optimize |
| Visual Polish | 9/10 | Excellent — teardrop balloons, monkey accessories, particles, weather |
| Audio | 8/10 | Procedural audio system is impressive for a prototype |
| Test Coverage | 5/10 | 6 tests cover happy paths; targeting, economy, edge cases untested |
| Bridge Layer | 7/10 | Clean architecture, missing robustness features |
| Gameplay | 7/10 | Fun and functional, balance needs tuning |
| Documentation | 8/10 | Philosophy paper is exceptional, code comments are adequate |

**Overall: 7.1/10** — Strong prototype with excellent visual/audio polish. Needs bug fixes and test hardening before bridge integration.
