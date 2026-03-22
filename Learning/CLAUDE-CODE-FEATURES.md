# Claude Code Features Tracker

> Last updated: 2026-03-07 | Current version: **2.1.71** | Source: GitHub CHANGELOG.md, CLI introspection, npm registry

---

## Table of Contents

1. [Loop (`/loop`)](#1-loop-loop)
2. [Voice Mode](#2-voice-mode)
3. [Remote Control](#3-remote-control)
4. [Cron / Scheduling](#4-cron--scheduling)
5. [Worktrees](#5-worktrees)
6. [Agent SDK](#6-agent-sdk)
7. [Agent Teams (Multi-Agent)](#7-agent-teams-multi-agent)
8. [Custom Agents](#8-custom-agents)
9. [Plugin System & Marketplace](#9-plugin-system--marketplace)
10. [Telegram Integration](#10-telegram-integration)
11. [OpenClaw / Open-Source Agent](#11-openclaw--open-source-agent)
12. [Chrome Integration](#12-chrome-integration)
13. [Auto-Memory](#13-auto-memory)
14. [Fast Mode / Effort Levels](#14-fast-mode--effort-levels)
15. [Other Notable Features](#15-other-notable-features)

---

## 1. Loop (`/loop`)

**Status:** SHIPPED (v2.1.71, 2026-03-06)

### What It Does
Runs a prompt or slash command on a recurring interval within a session. This is a lightweight, in-session scheduling mechanism -- not a system-level cron, but a live loop that re-executes a prompt every N minutes.

### How to Use
```
/loop 5m check the deploy
/loop 10m /morning
/loop 2m run the tests and report failures
```

The syntax is `/loop <interval> <prompt or /command>`. The interval uses shorthand like `5m` (5 minutes), `1h` (1 hour), etc.

### Key Details
- Runs within a live Claude Code session (session must stay open)
- Can trigger any prompt or slash command on repeat
- Paired with the new "cron scheduling tools" (CronCreate/CronDelete) that were also added in 2.1.71

### Relevance to Life-OS
- **Monitoring loops**: `/loop 5m check deploy status for Garage33` -- continuous deployment watch
- **Recurring reminders**: `/loop 30m /blockers` -- surface blockers every 30 minutes during work sessions
- **Health checks**: `/loop 10m check if the dev server is still running`
- **Accountability**: `/loop 1h /truth` -- periodic reality check during deep work sessions
- Combined with the CoS agent, this enables a persistent monitoring layer during active sessions

---

## 2. Voice Mode

**Status:** SHIPPED (rolling improvements across v2.1.49 through v2.1.71)

### What It Does
Push-to-talk voice input using speech-to-text (STT). Hold the space bar (or a custom key), speak, and your speech is transcribed into the Claude Code input field. This is NOT voice output -- Claude still responds in text.

### How to Enable
1. Set `voiceEnabled: true` in your `settings.json` (or toggle via `/config`)
2. Hold the space bar (default) to activate push-to-talk
3. Release to submit the transcribed text

### Customization
- **Rebindable key**: `voice:pushToTalk` keybinding in `keybindings.json` (added v2.1.71)
  - Default: `space`
  - Supports modifier+letter combos like `meta+k` to avoid typing interference
- **Supported languages (20 total, as of v2.1.69)**:
  - Original 10: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic
  - Added in v2.1.69: Russian, Polish, Turkish, Dutch, Ukrainian, Greek, Czech, Danish, Swedish, Norwegian

### Known Issues Fixed
- v2.1.71: Fixed 5-8 second startup freeze caused by CoreAudio initialization
- v2.1.70: Fixed voice mode failing on Windows native binary ("native audio module could not be loaded")
- v2.1.70: Fixed push-to-talk not activating on session start when `voiceEnabled: true`
- v2.1.69: Improved error message when microphone captures silence
- v2.1.69: Fixed waveform cursor covering the first suffix letter when dictating mid-input
- v2.1.69: Fixed space bar getting stuck after failed voice activation

### Relevance to Life-OS
- Hands-free interaction with the CoS during planning sessions
- Voice-driven `/morning` briefings and `/end-of-day` closings
- Natural language task entry during walks/commute
- Arabic support means potential for Arabic content workflows

---

## 3. Remote Control

**Status:** SHIPPED (introduced v2.1.51, expanded v2.1.58, ongoing improvements)

### What It Does
Remote Control lets you connect a local Claude Code terminal session to the claude.ai web interface. You can view, interact with, and control your terminal-running Claude Code from any browser -- including mobile (Android/iOS). The local machine does the work; the browser is the remote display.

### How to Use

**From within a session:**
```
/remote-control
/remote-control My Project
```

**From the CLI:**
```bash
claude remote-control
claude remote-control --name "My Project"
```

**Then open:** `claude.ai/code` in your browser to see and interact with the session.

### Key Details
- Local environment serves the session -- your machine runs the code, browser is a viewer/controller
- Custom session titles visible in claude.ai/code (v2.1.69)
- Works on Android (v2.1.69 fixed crash with `/voice` and `/cost` in Remote Control sessions)
- Polling rate optimized: once per 10 minutes while connected (was 1-2s), 300x server load reduction (v2.1.70)
- Reconnection is fast -- transport loss immediately wakes fast polling
- Policy limits supported for Team and Enterprise plans (v2.1.69)

### Architecture
- Uses a bridge/WebSocket connection between your terminal and claude.ai
- Session reconnection completes within seconds after laptop wake from sleep (v2.1.70)

### Relevance to Life-OS
- **Mobile CoS access**: Control Life-OS agents from your phone via claude.ai/code
- **Multi-device workflow**: Start a session on desktop, monitor/interact from tablet or phone
- **Deployment monitoring**: Run `/loop 5m check deploy` locally, watch results from anywhere
- **Meeting mode**: Have the CoS running on your laptop while interacting via phone during meetings

---

## 4. Cron / Scheduling

**Status:** SHIPPED (v2.1.71)

### What It Does
Cron scheduling tools (CronCreate, CronDelete) enable recurring prompts within a session. These work alongside `/loop` to provide programmatic scheduling.

### How to Use
The cron tools are available as built-in tools that Claude can invoke during a session. They allow creating and deleting scheduled recurring prompts.

### Key Details
- Session-scoped: schedules exist within a live Claude Code session
- Complement `/loop` for more granular control
- These are tools available to Claude itself (CronCreate/CronDelete), not slash commands

### Relevance to Life-OS
- Agent-driven scheduling: the CoS can schedule its own recurring checks
- Build automated monitoring workflows that the agent manages itself
- Pair with hooks for event-driven automation within sessions

---

## 5. Worktrees

**Status:** SHIPPED (introduced v2.1.49, matured through v2.1.71)

### What It Does
Git worktrees provide isolated working environments for agents. Each worktree is a separate checkout of the same repo, allowing parallel work on different branches without conflicts.

### How to Use

**CLI flag:**
```bash
claude --worktree              # auto-named worktree
claude --worktree my-feature   # named worktree
claude -w                      # shorthand
```

**With tmux (for agent teams):**
```bash
claude --worktree --tmux       # creates worktree + tmux session
```

**In agent definitions (frontmatter):**
```yaml
---
isolation: worktree
---
```

**EnterWorktree tool:** Available within a session to create a worktree on demand.

### Key Details
- Worktrees are created in `.claude/worktrees/` with a new branch based on HEAD
- On session exit, you're prompted to keep or remove the worktree
- Project configs and auto-memory are shared across git worktrees of the same repo (v2.1.63)
- `WorktreeCreate` and `WorktreeRemove` hook events for custom setup/teardown (v2.1.50)
- Subagents support `isolation: "worktree"` for working in temporary worktrees (v2.1.49)
- Agent definitions support `background: true` to always run as background tasks (v2.1.49)
- Works outside git repos via WorktreeCreate/WorktreeRemove hooks for VCS-agnostic isolation
- Fixed: worktree file copy on Windows (v2.1.69), session matching with drive letter casing (v2.1.47)

### Relevance to Life-OS
- **Parallel project work**: Spawn worktrees for Garage33, IntelligenceMasters, etc. simultaneously
- **Safe experimentation**: Agent works in isolated branch, merge only if successful
- **Agent team isolation**: Each teammate agent gets its own worktree to avoid conflicts
- **Background tasks**: Long-running code generation in a worktree while you work in main

---

## 6. Agent SDK

**Status:** SHIPPED (Python SDK v0.0.25, TypeScript via Claude Code CLI)

### What It Does
The Agent SDK allows building custom applications and workflows that programmatically interact with Claude Code. It wraps Claude Code's `--print` mode with structured I/O.

### Available SDKs

**Python SDK** (`claude-code-sdk` on PyPI):
```bash
pip install claude-code-sdk
```
- Version: 0.0.25
- Repo: github.com/anthropics/claude-code-sdk-python
- Dependencies: anyio, mcp
- Provides programmatic access to Claude Code sessions

**TypeScript/CLI SDK:**
- Use Claude Code CLI with `--print` and `--output-format stream-json`
- `--input-format stream-json` for bidirectional streaming
- `--json-schema` for structured output validation
- `--max-budget-usd` for cost control

### SDK Features (from changelog)
- `SDKRateLimitInfo` and `SDKRateLimitEvent` types for rate limit monitoring (v2.1.45)
- `SDKUserMessageReplay` events when `replayUserMessages` is enabled (v2.1.47)
- Model info includes `supportsEffort`, `supportedEffortLevels`, `supportsAdaptiveThinking` (v2.1.49)
- Task creation no longer requires `activeForm` field (v2.1.69)
- `CLAUDE_CODE_ACCOUNT_UUID`, `CLAUDE_CODE_USER_EMAIL`, `CLAUDE_CODE_ORGANIZATION_UUID` env vars for SDK callers (v2.1.51)
- Permission suggestions populated for SDK consumers (v2.1.49)
- Fixed background task notifications in streaming Agent SDK mode (v2.1.41)
- Fixed subagents not accessing SDK-provided MCP tools (v2.1.30)

### Relevance to Life-OS
- **Custom CoS automation**: Build Python scripts that invoke Claude Code for specific tasks
- **Webhook integrations**: Process incoming events and trigger Claude Code sessions
- **Scheduled workflows**: Cron job + SDK = automated daily reports, code reviews, etc.
- **Multi-project orchestration**: Script that runs Claude Code across all project directories

---

## 7. Agent Teams (Multi-Agent)

**Status:** SHIPPED (research preview, v2.1.32+)

### What It Does
Multi-agent collaboration where multiple Claude instances work as teammates in parallel, each in their own tmux pane or worktree.

### How to Enable
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### Key Details
- Requires setting `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Token-intensive feature (each agent has its own context window)
- Teammate navigation: Shift+Down (with wrapping) to cycle between agents
- Ctrl+F to kill all background agents (two-press confirmation)
- `TeammateIdle` and `TaskCompleted` hook events for workflow automation (v2.1.33)
- Agents can restrict which sub-agents spawn via `Task(agent_type)` syntax (v2.1.33)
- Memory frontmatter field for persistent memory with `user`, `project`, or `local` scope (v2.1.33)
- Fixed nested teammate spawning, model identifier issues on Bedrock/Vertex/Foundry

### Relevance to Life-OS
- **Parallel project workers**: One agent on Garage33, another on IntelligenceMasters, a third monitoring
- **CoS + specialist agents**: Main CoS delegates to domain-specific agents
- **Code review pipeline**: One agent writes code, another reviews it simultaneously
- **Research + implementation**: Research agent explores while implementation agent builds

---

## 8. Custom Agents

**Status:** SHIPPED (mature feature)

### What It Does
Define custom agents with specific roles, prompts, tools, and behaviors using markdown files.

### How to Use

**CLI flags:**
```bash
claude --agent reviewer
claude --agents '{"reviewer": {"description": "Reviews code", "prompt": "You are a code reviewer"}}'
```

**Agent definition files:** Place `.md` files in `.claude/agents/`

**Frontmatter options:**
```yaml
---
description: "Agent description"
model: "claude-opus-4-6"
isolation: worktree
background: true
memory: project
tools:
  - Bash
  - Edit
  - Read
  - Task(sub-agent-name)
hooks:
  PreToolUse: ...
  PostToolUse: ...
  Stop: ...
---
Your agent prompt here.
```

**List agents:**
```bash
claude agents
```

### Key Details
- Agents inherit project settings, CLAUDE.md, and skills
- `background: true` runs the agent as a background task
- `isolation: worktree` for isolated git worktree
- Agent name displayed in terminal title (v2.1.69)
- Agent `model` field now works for team teammates (v2.1.47)
- `--resume` re-uses `--agent` value from previous conversation (v2.1.32)
- Plugin agents also supported

### Relevance to Life-OS
- **This is already in use**: Life-OS has daily-ops, personas, and meta agents defined
- **Enhance existing agents**: Add `isolation: worktree` and `background: true` to agents
- **Project-specific agents**: Define agents per-project (Garage33 agent, IM agent, etc.)

---

## 9. Plugin System & Marketplace

**Status:** SHIPPED (v2.1.45+, actively developing)

### What It Does
Installable plugins that extend Claude Code with custom commands, agents, tools, hooks, MCP servers, and settings. Plugins can be distributed via marketplaces (GitHub repos, npm, local paths).

### How to Use

**Install a plugin:**
```bash
claude plugin install <plugin>
claude plugin install plugin@marketplace
```

**Manage plugins:**
```bash
claude plugin list
claude plugin enable <plugin>
claude plugin disable <plugin>
claude plugin uninstall <plugin>
claude plugin update <plugin>
```

**Manage marketplaces:**
```bash
claude plugin marketplace add <source>      # URL, path, or GitHub repo
claude plugin marketplace list
claude plugin marketplace update [name]
claude plugin marketplace remove <name>
```

**Validate a plugin:**
```bash
claude plugin validate <path>
```

**Reload without restart:**
```
/reload-plugins
```

### Key Details
- Plugins can ship `settings.json` for default configuration (v2.1.49)
- Plugin source types: npm, git repo, git-subdir, local path (v2.1.69)
- Custom npm registries supported for private plugins (v2.1.51)
- `pluginTrustMessage` for org-specific trust warnings (v2.1.69)
- `strictKnownMarketplaces` with `hostPattern` and `pathPattern` (v2.1.69)
- Plugin-provided MCP servers deduplicated against manual configs (v2.1.71)
- `${CLAUDE_PLUGIN_ROOT}` variable for plugin commands
- `--plugin-dir` flag to load plugins from specific directories

### Relevance to Life-OS
- **Build Life-OS as a plugin**: Package the CoS system as a distributable plugin
- **Community plugins**: Install productivity, monitoring, and automation plugins
- **Private marketplace**: Host a private marketplace with custom Life-OS extensions
- **Share across machines**: Install the same plugin set on any machine

---

## 10. Telegram Integration

**Status:** NOT FOUND / NOT A NATIVE FEATURE

### Research Findings
- No mention of Telegram in the Claude Code changelog (searched all versions)
- No native Telegram integration exists in Claude Code
- No official Telegram bot or connector

### Possible Workarounds
1. **MCP Server approach**: Build a custom MCP server that connects to the Telegram Bot API, then configure it in Claude Code
2. **SDK + Telegram Bot**: Use the Python `claude-code-sdk` + `python-telegram-bot` to build a bridge
3. **Webhook + Remote Control**: Use Telegram webhooks to trigger Claude Code sessions via the SDK
4. **n8n/Make automation**: Use workflow automation tools to bridge Telegram and Claude Code

### Relevance to Life-OS
- Would need to be custom-built using the SDK or MCP server approach
- Could enable mobile CoS interaction via Telegram (alternative to Remote Control)
- An MCP server wrapping the Telegram API is the most practical path

---

## 11. OpenClaw / Open-Source Agent

**Status:** NOT FOUND IN CHANGELOG

### Research Findings
- No mention of "OpenClaw" in the Claude Code changelog
- Claude Code itself is not open-source -- the GitHub repo (anthropics/claude-code) hosts the changelog, issues, and plugins but the core code is proprietary
- The closest equivalent to "open-source agent features" are:
  - Custom agents (`.claude/agents/*.md`)
  - Plugin system with marketplace
  - SDK for building custom agent workflows
  - `--dangerously-skip-permissions` for autonomous operation in sandboxes

### Autonomous Agent Capabilities
- `--permission-mode auto` for automatic permission handling
- `--dangerously-skip-permissions` for fully autonomous (sandbox-only)
- `--max-budget-usd` for cost control in autonomous runs
- Background agents with `background: true` in agent definitions
- Agent teams for multi-agent autonomous workflows

### Relevance to Life-OS
- Use `--permission-mode auto` + `--max-budget-usd` for autonomous Life-OS agents
- Combine with cron/scheduling for unattended operation
- SDK enables building custom autonomous agent orchestrators

---

## 12. Chrome Integration

**Status:** SHIPPED (v2.1.69+)

### What It Does
Connects Claude Code to a local Chrome browser for web interaction capabilities.

### How to Enable
```bash
claude --chrome        # enable
claude --no-chrome     # disable
```

### Key Details
- Auto-detects Chrome installation
- Fixed: auto-detection getting permanently stuck on "not installed" after running on a machine without local Chrome (v2.1.71)

### Relevance to Life-OS
- Web scraping and interaction without MCP tools
- Browser automation for testing deployed sites
- Visual verification of web projects (Garage33, IntelligenceMasters)

---

## 13. Auto-Memory

**Status:** SHIPPED (v2.1.32+)

### What It Does
Claude automatically records and recalls memories as it works. Useful context is persisted across sessions without manual `/memory` commands.

### Key Details
- Introduced in v2.1.32: "Claude now automatically records and recalls memories as it works"
- Manage with `/memory` command
- Memory shared across git worktrees of the same repository (v2.1.63)
- Agent definitions support `memory` frontmatter with `user`, `project`, or `local` scope (v2.1.33)
- Fixed: stale skill content persisting after `/clear` (v2.1.63)

### Relevance to Life-OS
- CoS remembers project states, patterns, and CEO preferences automatically
- Cross-session continuity without manual handoff notes
- Agent-specific memory scopes for different Life-OS agents

---

## 14. Fast Mode / Effort Levels

**Status:** SHIPPED (v2.1.36+)

### What It Does
Controls how much thinking/effort Claude puts into responses. Lower effort = faster responses for simple tasks.

### Effort Levels
- **Low**: Quick responses, minimal thinking
- **Medium**: Default for Opus 4.6 on Max/Team (v2.1.68)
- **High**: Maximum thinking, triggered by "ultrathink" keyword (v2.1.68)

### How to Use
```bash
claude --effort low
claude --effort medium
claude --effort high
```

Or within a session:
- `/model` to change effort level
- Type "ultrathink" to enable high effort for next turn

### Key Details
- Opus 4.6 defaults to medium effort for Max/Team subscribers (v2.1.68)
- Fast mode available for Opus 4.6 (v2.1.36)
- Opus 4.6 (fast mode) includes full 1M context window (v2.1.50)
- Effort level display in logo/spinner (v2.1.69)

### Relevance to Life-OS
- Use low effort for quick lookups and status checks
- Use high effort (ultrathink) for complex planning and architecture decisions
- Default medium is the sweet spot for most CoS operations

---

## 15. Other Notable Features

### Hooks System (v2.1.33+)
- **PreToolUse, PostToolUse, Stop, SubagentStop** hook events
- **SessionStart, SessionEnd, InstructionsLoaded, ConfigChange** lifecycle events
- **WorktreeCreate, WorktreeRemove** for worktree lifecycle
- **TeammateIdle, TaskCompleted** for multi-agent workflows
- **HTTP hooks**: POST JSON to a URL and receive JSON (v2.1.63)
- Hooks work in agent frontmatter for agent-scoped automation

### MCP Server Management
- `claude mcp add` / `remove` / `list` / `get` commands
- HTTP transport support for remote MCP servers
- OAuth authentication with auto-refresh
- claude.ai MCP connectors (v2.1.46+)
- Native MCP management dialog in VS Code (v2.1.70)
- `claude mcp serve` to run Claude Code as an MCP server itself

### Session Management
- `/resume` to pick up previous sessions
- `/fork` to branch a conversation
- `--from-pr` to resume sessions linked to a GitHub PR (v2.1.27)
- `--fork-session` to create new session ID when resuming
- Session persistence across reconnects

### VS Code Integration
- Spark icon in activity bar listing all sessions (v2.1.70)
- Plans as full markdown documents with commenting (v2.1.70)
- Native MCP server management (v2.1.70)
- Remote session browsing for OAuth users (v2.1.33)
- Session rename and remove actions

### Security & Sandbox
- macOS sandbox with network isolation
- `sandbox.excludedCommands` for exceptions
- `--permission-mode` choices: acceptEdits, bypassPermissions, default, dontAsk, plan, auto
- Managed settings via macOS plist or Windows Registry (v2.1.51)

### Bundled Skills
- `/simplify` and `/batch` (v2.1.63)
- `/claude-api` for building with the Claude API (v2.1.69)
- `/security-review` for security audits
- `/debug` for troubleshooting (v2.1.30)
- `/color` for terminal color customization
- `/stats` for session statistics
- `/context` for context window inspection

### Performance (recent improvements)
- 16MB memory reduction via deferred Yoga WASM (v2.1.69)
- 74% fewer prompt input re-renders (v2.1.70)
- 426KB startup memory reduction (v2.1.70)
- Session resume 68% faster (v2.1.30)

---

## Version History (2.1.49 through 2.1.71)

| Version | Key Addition |
|---------|-------------|
| 2.1.71  | `/loop` command, cron tools, voice keybinding customization |
| 2.1.70  | Remote Control optimization, voice fixes on Windows, VS Code spark icon |
| 2.1.69  | `/remote-control` naming, 10 new voice languages, `/reload-plugins`, hooks enhancements |
| 2.1.68  | Opus 4.6 medium effort default, ultrathink keyword |
| 2.1.63  | `/simplify`, `/batch`, HTTP hooks, auto memory shared across worktrees |
| 2.1.59  | Auto-memory (automatic), `/copy` command |
| 2.1.58  | Remote Control expansion to more users |
| 2.1.51  | `claude remote-control` CLI subcommand, plugin marketplace improvements |
| 2.1.50  | WorktreeCreate/WorktreeRemove hooks, `isolation: worktree` in agent defs |
| 2.1.49  | `--worktree` flag, background agents, plugin `settings.json` |

---

## Priority Actions for Life-OS

### Immediate (This Week)
1. **Enable voice mode**: Set `voiceEnabled: true` in settings for hands-free CoS interaction
2. **Test `/loop`**: Use `/loop 30m /blockers` during work sessions for periodic accountability
3. **Set up Remote Control**: Run `/remote-control Life-OS` for mobile access via claude.ai/code

### Short-Term (This Month)
4. **Enable Agent Teams**: Set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` for multi-agent workflows
5. **Add `isolation: worktree`** to daily-ops and meta agents for safe parallel operation
6. **Explore plugin marketplace**: Look for productivity plugins; evaluate packaging Life-OS as a plugin

### Medium-Term (Next Quarter)
7. **Build Telegram MCP server**: Custom bridge between Telegram and Claude Code for mobile CoS
8. **SDK automation scripts**: Python scripts using `claude-code-sdk` for scheduled workflows (daily briefings, weekly reports)
9. **Autonomous agent pipelines**: Use `--permission-mode auto` + `--max-budget-usd` for unattended agents

---

*This document is the reference for Life-OS unified workspace development. Update when new versions ship.*
