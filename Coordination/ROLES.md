# Machine Fleet - Life-OS Multi-Device Architecture

> Each machine has a name, a role, and a character. The name is how the CoS refers to it.

## The Fleet

### Atlas (`noahreese` / formerly `vm`)
- **Character**: The tireless guardian. Never sleeps. Runs the night shift.
- **Hardware**: Mac Mini Intel 2018 (Boot Camp Windows 10)
- **Uptime**: Always on (24/7)
- **Role**: Primary workhorse
- **Capabilities**: All autonomous scripts, Claude CLI, Obsidian Sync, VeraCrypt vault (V:\), Remote Control host, full admin
- **Special access**: Encrypted vault with UltrawashApp, HardwareAdPlus, IntelligenceMasters
- **Default assignment**: ALL scheduled tasks + vault-dependent work + Remote Control hosting

### Nomad (any mobile device)
- **Character**: The scout. Lightweight, fast, wherever Noah is.
- **Hardware**: Phone, laptop, iPad - whatever Noah has on him
- **Uptime**: Intermittent (when CEO is mobile)
- **Role**: Mobile command post
- **Capabilities**: Claude Code via Remote Control (connects to Atlas) or claude.ai/code
- **Special access**: None (everything runs through Atlas)
- **Default assignment**: On-demand CEO interactions, quick decisions, mobile capture

### Forge (TBD - future)
- **Character**: The blacksmith. Raw power for heavy lifting.
- **Hardware**: Desktop with GPU / dedicated compute rig
- **Uptime**: On-demand or scheduled
- **Role**: Heavy compute
- **Capabilities**: ML training, video rendering, batch image generation, large builds
- **Default assignment**: GPU workloads dispatched by Atlas

## Assignment Rules

1. **All scheduled tasks** go to Atlas (it's always on)
2. **Vault-dependent tasks** go to Atlas (only machine with VeraCrypt)
3. **Mobile interactions** go through Nomad (via Remote Control to Atlas)
4. **Heavy compute** goes to Forge (when it exists)
5. **Heartbeat** runs on all machines with Claude Code installed
6. **Failover**: If Atlas goes down, Nomad can connect directly to claude.ai for basic CoS functions

## Machine ID Mapping

| Name | Username | Legacy ID | Status |
|------|----------|-----------|--------|
| Atlas | noahreese | vm, mac-mini | Active (primary) |
| Nomad | varies | n/a | Active (via Remote Control) |
| Forge | TBD | n/a | Future |

> **Note**: Atlas is a single physical machine (Mac Mini) running Boot Camp Windows. The old "mac-mini" and "vm" IDs in REGISTRY.md both refer to Atlas. The registry still uses old IDs for backward compatibility with guard.ps1 until migrated.

## Adding a New Machine

1. Install Claude Code + authenticate
2. Set up Obsidian vault sync
3. Create `~/.claude/local/MACHINE.md` with identity
4. Add to REGISTRY.md and this file
5. Run `deploy-agents.ps1`
6. Register Task Scheduler entries
7. Run heartbeat.ps1 to verify
