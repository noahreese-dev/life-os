# Shared Context - Life-OS Cross-Machine State

> Updated by whichever machine is active. Read by any machine on session start.
> This is the "what you need to know right now" file.

## Last Updated
2026-03-18 by Atlas (autoresearch cycle)

## Current Sprint Goals (Week of Mar 17)
1. Ship HW Ad+ video draft to Boz (OVERDUE - was due Mar 17)
2. Manas meeting follow-up (happened Mar 17)
3. Continue ICS/UltrawashAPP readiness
4. System infrastructure: multi-device coordination (IN PROGRESS)

## Active Blockers
| Blocker | Owner | Days Stale | Action |
|---------|-------|-----------|--------|
| ICS API pricing callback | External (Summer/CTO) | 11+ days | Be ready when they call |
| Boz scope response | External (Boz) | 23+ days | Manas meeting was forcing function |
| Landlord messages unsent | CEO (manual) | 8+ days | Requires Facebook login |
| Git user.name/email not configured | System | Since setup | Commits will fail |

## Recent System Changes (Mar 18)
- Multi-device coordination layer built (guard.ps1, REGISTRY.md, HEARTBEAT.md)
- All 11 autonomous scripts guarded with ownership checks
- Heartbeat task registered (every 30 min)
- deploy-agents.ps1 created (canonical agents with {variables})
- Power settings fixed: hidden unattended sleep timeout was 2 min (now disabled)
- UAC disabled: full admin access for Claude Code
- Hibernate disabled
- Remote Control auto-enabled (remoteControlAtStartup: true)
- Obsidian added to Windows Startup (sync stays alive 24/7)
- gsudo installed for elevated commands
- Machine naming system: Atlas (this machine), Vault (VeraCrypt), Nomad (mobile), Forge (future GPU)

## Cross-Machine Notes
- Atlas heartbeat: online, 214.9 GB free, 12 tasks/24h, 0 errors
- Mac Mini (Pc) not yet bootstrapped for coordination layer
- Obsidian Sync now live on Atlas (started 2026-03-18 16:40)
- REGISTRY.md still uses 'mac-mini' and 'vm' as machine IDs (needs migration to 'atlas')

## CEO State
- Ramadan (fasting) - Eid expected any day
- Cash: ~$2,550 estimated
- Energy: system-building mode (infrastructure day)
