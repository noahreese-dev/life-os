# Life-OS Multi-Device Architecture

> The system that runs Noah's life across every machine he touches.
> Central brain in Obsidian. Local muscle on each device. One CoS, many hands.

## Design Principles

1. **One source of truth** - Obsidian vault is the shared brain. All state, goals, metrics, and coordination live here.
2. **Local execution, central knowledge** - Each machine runs its own scripts but reads from the shared vault.
3. **Named machines, not usernames** - Each device has an identity, a role, and personality.
4. **Graceful degradation** - If sync lags or a machine goes offline, others continue independently.
5. **Zero-config growth** - Adding a third (or fourth) machine is: add to REGISTRY.md, run bootstrap, done.

---

## Machine Fleet

Each machine in the fleet has a **name**, a **role**, and a **character**. The name is how the CoS refers to it. The character informs how its local orchestrator communicates.

| Name | Username | Hardware | Role | Character |
|------|----------|----------|------|-----------|
| **Atlas** | `noahreese` | Mac Mini Intel (Boot Camp) | Workhorse - always on, 24/7 background ops, Remote Control host | The tireless guardian. Never sleeps. Runs the night shift. |
| **Vault** | (via VeraCrypt on Atlas) | Same hardware, encrypted partition | Secure workspace - encrypted project codebases | The lockbox. Only opens for the CEO. |
| **Nomad** | TBD | Laptop / iPad / phone | Mobile command - on-the-go access via Remote Control or claude.ai | The scout. Lightweight, fast, wherever Noah is. |
| **Forge** | TBD | Future desktop / GPU rig | Heavy compute - ML training, video rendering, batch processing | The blacksmith. Raw power for heavy lifting. |

> **Atlas** is the current primary. **Vault** is a logical partition on Atlas (VeraCrypt V:\). **Nomad** is any device connecting via Remote Control. **Forge** is future-state.

---

## Knowledge Architecture

### Shared Layer (Obsidian Vault - synced to all devices)

```
ObsidianVault/
  STATUS.md              -- Project dashboard (THE source of truth)
  METRICS.md             -- Life-OS rating, experiments, scoring
  WEEKLY-LOG.md          -- Weekly commitments and daily progress
  CLAUDE.md              -- CoS instructions (all machines read this)

  Coordination/
    REGISTRY.md          -- Task ownership (who runs what)
    ROLES.md             -- Machine fleet definitions
    HEARTBEAT.md         -- Machine health (each writes its own section)
    ARCHITECTURE.md      -- This file (system design)
    guard.ps1            -- Ownership check function
    SHARED-CONTEXT.md    -- Cross-machine context (what any machine needs to know)

  Agents/                -- Canonical agent definitions (with {variables})
    autoresearch.md
    verifier.md
    orchestrator.md      -- Per-machine orchestrator template

  Days/                  -- Daily logs (CEO writes, system reads)
  briefings/             -- System-generated outputs (briefings, reports)
  Projects/              -- Project notes and assessments
```

**What goes in shared**: Anything that any machine might need to act on. State, goals, metrics, coordination, agent definitions, briefings.

### Local Layer (machine-specific, NOT synced)

```
~/.claude/
  agents/                -- Deployed agents (resolved from vault templates)
  autonomous/            -- Machine-specific scripts
  settings.json          -- Machine-specific permissions and hooks
  settings.local.json    -- Machine-specific overrides
  lessons.md             -- Global lessons (manually synced if needed)
  memory/                -- Claude Code memory (conversation-specific)

~/.claude/local/         -- NEW: machine-specific persistent state
  MACHINE.md             -- This machine's identity and capabilities
  LOCAL-CONTEXT.md       -- Things only this machine knows/needs
  last-research.md       -- Last autoresearch cycle results
```

**What goes in local**: Machine-specific config, credentials, paths, runtime state. Things that don't make sense on other machines.

---

## Orchestrator Pattern

Each machine runs a **local orchestrator** - a Claude Code session (or agent) that:
1. Reads the shared vault for goals and context
2. Reads its local MACHINE.md for identity and capabilities
3. Executes tasks assigned to it in REGISTRY.md
4. Writes results back to the shared vault (briefings/, HEARTBEAT.md)
5. Never conflicts with other machines (guard.ps1 prevents overlap)

### Atlas Orchestrator (always-on)
- Runs all scheduled tasks (briefings, nudges, monitoring)
- Hosts Remote Control for mobile access
- Runs overnight Ralph sessions
- Writes to HEARTBEAT.md every 30 min

### Nomad Pattern (stateless)
- Connects via Remote Control or claude.ai/code
- Reads shared vault for full context
- Sends commands that Atlas executes
- No local state needed - everything lives in the vault or on Atlas

### Forge Pattern (future)
- Receives heavy compute jobs via task queue in vault
- Writes results back to shared vault
- Specializes in GPU workloads (rendering, training, batch image gen)

---

## Shared Context File

`SHARED-CONTEXT.md` is the file any machine reads to get up to speed instantly. It contains:
- Current sprint goals (what matters this week)
- Active blockers (what's stuck and why)
- Recent decisions (last 3-5 decisions with rationale)
- Cross-machine notes (e.g. "Atlas ran overnight Ralph, found X")

This file is updated by:
- Morning briefing (Atlas writes it)
- Nightly accountability (Atlas writes it)
- CEO sessions (whichever machine is active)
- Autoresearch cycles (whichever machine runs them)

---

## Sync Rules

| Data | Direction | Mechanism | Frequency |
|------|-----------|-----------|-----------|
| Vault state (STATUS, METRICS, etc.) | All machines read | Obsidian Sync | Real-time |
| Heartbeat | Each machine writes its section | Obsidian Sync | Every 30 min |
| Task registry | CoS edits, all machines read | Obsidian Sync | On change |
| Briefings | Writer machine creates, all can read | Obsidian Sync | Per event |
| Agent definitions | Canonical in vault, deployed locally | deploy-agents.ps1 | On demand |
| Local config | Machine-specific, never synced | N/A | Local only |

---

## Bootstrap Protocol (New Machine)

1. Install Claude Code + authenticate
2. Clone/sync the Obsidian vault
3. Create `~/.claude/local/MACHINE.md` with machine identity
4. Run `deploy-agents.ps1` to resolve canonical agents for this machine
5. Add machine to REGISTRY.md and ROLES.md
6. Register Task Scheduler entries
7. Run heartbeat.ps1 to verify connectivity
8. Done - machine is part of the fleet

---

## Failover Protocol

1. Heartbeat check: if a machine's last check-in is >2 hours stale
2. Any machine can temporarily claim tasks by editing REGISTRY.md
3. When the offline machine comes back, it checks REGISTRY.md and yields
4. The guard function handles all of this automatically

---

## Future: Agent Swarm

When Forge comes online with GPU:
- Atlas dispatches compute jobs to Forge via a task queue in the vault
- Forge picks up jobs, processes them, writes results back
- Atlas monitors completion and routes results to the right place
- Multiple agents can run in parallel across machines without conflict

The coordination layer we have today (guard + registry + heartbeat) scales to this naturally.
