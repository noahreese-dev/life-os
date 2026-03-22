# Life-OS Metrics — The Karpathy Loop Applied to Life

> "Any metric you care about that is reasonably efficient to evaluate can be autoresearched by an agent swarm." — Karpathy
>
> Core insight: You're programming the researcher, not the experiment. The CEO sets the goals. The CoS runs the loop — tracks metrics daily, identifies what moved the needle, proposes behavioral experiments, measures results. Life and business become a science experiment.

## The Three Karpathy Principles Applied

| Karpathy | Life-OS Equivalent |
|----------|-------------------|
| One editable artifact (train.py) | CEO's daily behavior — environment, routines, decisions |
| One scalar metric (val_bpb) | Multiple tracked metrics below — each with clear direction |
| One time-boxed cycle (5 min) | 1 day = 1 experiment. Day log = experiment result. |

The CoS role shifts from advisor to experimental designer. Each week = a research sprint. Each day = one data point. Patterns emerge from 7+ data points. Interventions are proposed as hypotheses, not opinions.

---

## Tracked Metrics

### MONEY (Business Health)

| Metric | How Measured | Direction | Frequency |
|--------|-------------|-----------|-----------|
| Cash position | Bank balance (CEO confirms) | Higher = better | Weekly verify |
| Revenue collected | Running total of actual money received | Higher = better | Per event |
| Revenue invoiced | Outstanding invoices | Track aging | Per event |
| Projects shipped | Cumulative deliverables that crossed the finish line | Higher = better | Per event |
| Pipeline value | Total dollar value in active deals | Higher = better | Weekly |
| Days since last invoice | Calendar days since last invoice was sent | Lower = better | Daily |
| Follow-up velocity | Days between should follow up and actually doing it | Lower = better | Per event |

### BODY (Physical Health)

| Metric | How Measured | Direction | Frequency |
|--------|-------------|-----------|-----------|
| Exercise | Did a physical activity today? (soccer/gym/walk/pickleball) Y/N + type | More = better | Daily |
| Sleep quality | 1-5 self-score on waking. Factors: hours, latency, wake feeling | Higher = better | Daily |
| Sleep time | What time did you actually fall asleep? | Earlier = better | Daily |
| Wake time | What time did you get up? | Earlier = better | Daily |
| Left the house | Did you physically leave before noon? Y/N | Yes = better | Daily |

### MIND (Digital and Focus Health)

| Metric | How Measured | Direction | Frequency |
|--------|-------------|-----------|-----------|
| Digital Transcendence (HT) | 1-5 score. Phone/screen relationship quality. | Higher = better | Daily |
| Screen rot hours | Hours of non-productive screen (brain rot, doomscroll) | Lower = better | Daily |
| Contract score | X/Y on yesterday's contract items completed | Higher = better | Daily |
| Deep work hours | Estimated hours of focused, uninterrupted work | Higher = better | Daily |

### SOUL (Spiritual and Psychological Health)

| Metric | How Measured | Direction | Frequency |
|--------|-------------|-----------|-----------|
| Meditation | Did you do an experiential feeling-based, love and witnessing meditation? Y/N | Yes = better | Daily |
| Meditation quality | If yes: 1-5. Was it embodied (descent) or intellectual (observer)? | Higher = better | Daily |
| Mosque/community | Attended prayer or community gathering? Y/N | Track frequency | Daily |
| Descent score | 1-5. How much time was spent in the body vs. the head today? | Higher = better | Daily |
| Proactive courage | Did you do something requiring social/financial assertion? (calling ICS, sending invoice, hard conversation) Y/N + what | Track frequency | Daily |

---

## Daily Scorecard Template

Appended to each day log by the CoS:

```
## Metrics Scorecard

### Money
- Cash position: $___
- Revenue today: $___
- Days since last invoice: ___
- Proactive follow-up: Y/N (what?)

### Body
- Exercise: Y/N (type: ___)
- Sleep quality: _/5
- Slept at: ___
- Woke at: ___
- Left house before noon: Y/N

### Mind
- HT score: _/5
- Screen rot hours: ___
- Contract score: _/_
- Deep work hours: ___

### Soul
- Meditation: Y/N
- Meditation quality: _/5 (embodied/intellectual)
- Mosque/community: Y/N
- Descent score: _/5
- Proactive courage: Y/N (what?)
```

---

## The Auto-Research Loop

### Weekly Cycle (Every Sunday or Monday)

The CoS runs the loop automatically:

1. MEASURE — Aggregate the week's daily scorecards into a trends table.

2. ANALYZE — Identify:
   - Which metrics improved vs. declined vs. flatlined
   - Correlations: "Days CEO left the house correlated with 2x contract score"
   - Patterns: "Screen rot > 2hrs the night before leads to next day contract score dropping to 0-1"
   - Outlier days: What made the best day the best? What made the worst day the worst?

3. HYPOTHESIZE — Propose 1-2 behavioral experiments for next week:
   - "Hypothesis: If CEO leaves house before noon 4/5 days, average contract score will exceed 2.0"
   - "Hypothesis: If screen time after 11pm = 0 for 3 consecutive days, sleep quality will average 4+"
   - "Hypothesis: If meditation happens before phone, HT score will average 4+"

4. EXPERIMENT — CEO agrees or modifies hypotheses. CoS builds the environment:
   - Set reminders, adjust autonomous scripts, modify contract items
   - Remove friction for the desired behavior, add friction for the undesired

5. EVALUATE — Next week's loop starts by evaluating last week's hypotheses:
   - Did the experiment run? (compliance)
   - Did the metric move? (effect)
   - Keep, modify, or discard the intervention

### Monthly Pattern Report

Every 4 weeks, the CoS produces a deeper analysis:
- Rolling averages on all metrics
- Which interventions had lasting effect vs. which faded
- CEO behavioral model weights — what actually drives results vs. what feels like it should

---

## Baseline Metrics (Day 34 — March 17, 2026)

Establishing baselines from 34 days of data:

| Metric | Current Baseline | Source |
|--------|-----------------|--------|
| Cash position | ~$2,550 (estimated) | Last confirmed Mar 16 |
| Revenue collected (lifetime) | $2,170 | wins.md counter |
| Projects shipped | 1 (Garage33) | STATUS.md |
| Contract score avg | ~1.2/3 (Days 30-34) | Day logs |
| Exercise frequency | ~1x/week | Day log pattern |
| Sleep quality | ~2.5/5 (estimated) | Late nights dominant |
| Avg sleep time | ~2-3am | Pattern from logs |
| Avg wake time | ~11am-2pm | Pattern from logs |
| Left house frequency | ~2/7 days | Day log pattern |
| HT score avg | ~2.5/5 | Day logs |
| Meditation frequency | ~1-2x/week (intermittent) | Day logs |
| Proactive courage | ~1x/week | ICS, invoices, landlord delays |

These baselines will be updated weekly as real scorecard data comes in.

---

## Active Experiments (Week of Mar 17)

| # | Hypothesis | Metric | Target | Status |
|---|-----------|--------|--------|--------|
| 1 | ICS daily Telegram reminder at 10am will break the avoidance pattern | Follow-up velocity | Call happens within 1 day of reminder | ACTIVE |
| 2 | Screen cutoff at 11:30pm will improve next-day wake time | Wake time | Before 10am on 3+ days | PROPOSED |
| 3 | Finishing HW Ad+ video tonight enables demo prep focus | Days since last deliverable | Ship by Mar 17 EOD | ACTIVE |

## AutoResearch Log (Mar 17, 2026)

| # | Fix | Method | Verified (v1) | Verified (v2 — independent) | Impact |
|---|-----|--------|---------------|----------------------------|--------|
| 1 | Budget fix: email-monitor 0.10 → 0.50 | Edit script | Yes (change confirmed) | PASS — line 20: `--max-budget-usd 0.50`. File modified 16:21. Last run was 13:10 (BEFORE fix) with result 3221225786. Not yet validated by a post-fix run. | Deployed, awaiting validation |
| 2 | Budget fix: deploy-check 0.10 → 0.50 | Edit script | Yes (change confirmed) | PARTIAL — line 19: `--max-budget-usd 0.50`. File modified 16:21. Post-fix run at 16:29 returned result code 1 (generic failure, not budget). No log file created. Possible config/path issue. | Fix applied but still failing |
| 3 | Budget fix: morning-briefing 0.50 → 1.00 | Edit script | Yes (log: "Exceeded USD budget 0.5") | PASS — line 140: `--max-budget-usd 1.00`. File modified 16:22. Last run was 13:10 (BEFORE fix) with result 3221225786. Not yet validated by a post-fix run. | Deployed, awaiting validation |
| 4 | Budget fix: weekly-digest 0.50 → 1.00 | Edit script | Yes (same pattern as morning) | PASS — line 102: `--max-budget-usd 1.00`. File modified 16:22. Next run Fri Mar 20 7pm. Last run Mar 13 still had old result 3221225786. | Deployed, awaiting validation (Fri) |
| 5 | Budget fix: sleep-nudge 0.10 → 0.50 | Edit script | Yes (change confirmed) | PASS — line 36: `--max-budget-usd 0.50`. File modified 16:21. Never run yet (result 267011). First scheduled run tonight 11pm. | Deployed, first run pending tonight |
| 6 | Budget fix: phone-free-morning 0.10 → 0.50 | Edit script | Yes (change confirmed) | PASS — line 37: `--max-budget-usd 0.50`. File modified 16:21. Never run yet (result 267011). First scheduled run tomorrow 7:25am. | Deployed, first run pending tomorrow |
| 7 | Telegram bot restarted | Start-Process start-bot.ps1 | Yes — PID 87964, bot.log shows "Life-OS Telegram tunnel running" | PASS — PID 87964 confirmed running via `Get-Process`. Heartbeat fresh (5s ago), uptime ~15min, network "healthy". Bot.log shows restart at 16:23 and successful auth. BUT: log also shows prior EFATAL errors and 5-min timeouts (no Claude session responding). Bot is alive but messages won't process without an active Claude Code session. | Bot running, limited utility without active session |
| 8 | Register LifeOS-SleepNudge in Task Scheduler | Register-ScheduledTask 11pm daily | Scheduled (awaiting first run) | PASS — Trigger: 2026-03-17T23:00:00-07:00, DaysInterval=1, Enabled=True. Action: powershell.exe -ExecutionPolicy Bypass -File correct path. Never run yet (267011). Next run: tonight 11pm. | Registered correctly |
| 9 | Register LifeOS-PhoneFreeMorning in Task Scheduler | Register-ScheduledTask 7:25am daily | Scheduled (awaiting first run) | PASS — Trigger: 2026-03-17T07:25:00-07:00, DaysInterval=1, Enabled=True. Action: correct path. Never run yet (267011). Next run: tomorrow 7:25am. | Registered correctly |
| 10 | Register LifeOS-MiddayCheckin in Task Scheduler | Register-ScheduledTask 1pm daily | Yes — result code 0 on test run | PASS — Trigger: 2026-03-17T13:00:00-07:00, DaysInterval=1. Ran at 16:24, result 0. Next run: tomorrow 1pm. | Verified working |
| 11 | Register LifeOS-LeaveHouseNudge in Task Scheduler | Register-ScheduledTask 11am daily | Yes — result code 0 on test run | PASS — Trigger: 2026-03-17T11:00:00-07:00, DaysInterval=1. Ran at 16:24, result 0. Next run: tomorrow 11am. | Verified working |
| 12 | Register LifeOS-Claw3dCheck in Task Scheduler | Register-ScheduledTask 9am daily | Yes — result code 0 on test run | PASS — Trigger: 2026-03-17T09:00:00-07:00, DaysInterval=1. Ran at 16:24, result 0. Next run: tomorrow 9am. | Verified working |
| 13 | Remove broken gws mcp entry from ~/.mcp.json | Edit .mcp.json | Yes — was `gws mcp --services all` (command doesn't exist in v0.17.0) | PASS — ~/.mcp.json now contains `{"mcpServers": {}}` (empty). `claude mcp list` shows 4 healthy remote servers, no broken local entries. | Cleaned |

---

---

## META-METRIC: Life-OS Rating (0-100%)

The single number that captures how powerful the entire system is. Not just CEO behavior — the OS itself. Architecture, uptime, autonomy, integration, and impact.

**The scale:**

| Score | What it looks like |
|-------|-------------------|
| 0% | Chronic addiction. No productive use of technology. Mind cannot control itself. |
| 10% | Basic phone + laptop. No automation. No system. Pure willpower (which fails). |
| 20% | Some notes, some todos. Maybe an app or two. No integration. No agents. |
| 30% | Claude Code installed. Some skills written. No autonomous layer. System requires CEO to initiate everything. |
| 40% | Skills + agents configured. Some automation scripts exist. Telegram tunnel works. But uptime is spotty — things break, go stale, don't actually run. |
| 50% | Autonomous layer running daily (morning briefing, heartbeats, nudges). Telegram tunnel stable. Metrics tracked. CEO can delegate from phone. System works while CEO sleeps — sometimes. |
| 60% | 24/7 operation. Overnight worker running real tasks. All metrics auto-collected. Weekly auto-research loop producing real insights. System catches things CEO misses (bounced emails, stale follow-ups, pattern alerts). |
| 70% | Multi-agent swarms. Parallel overnight research + builds. System proactively generates revenue (lead sites, outreach, follow-ups) without CEO initiation. Voice interface working. Cross-device seamless. |
| 80% | System manages CEO's calendar, email, finances, health tracking autonomously. CEO sets direction, system executes. Life-OS is the primary interface to the world. Other people notice the difference. |
| 90% | Full integration: physical environment sensors, financial APIs, health trackers, social media, all feeding the loop. System predicts problems before they happen. CEO spends 80% of time on vision, 20% on execution. |
| 100% | Buddha and King Solomon with Jarvis. Perfect embodiment + perfect technology. The system is an extension of consciousness. Zero friction between intention and reality. |

### Current Life-OS Rating: 42/100 (verified Mar 17 by AutoResearch v2)

**Breakdown:**

| Component | Max | Current | Notes |
|-----------|-----|---------|-------|
| Architecture (skills, agents, hooks) | 15 | 12 | 48 skills, 10 agents, 5 hooks. Solid. No change from v1. |
| Autonomous uptime | 15 | 7 | 15 tasks registered (correct). BUT: 6 budget fixes deployed and not yet validated by successful runs. MorningBriefing and EmailMonitor still show crash code 3221225786 from pre-fix runs. DeployCheck returned error 1 even AFTER fix. 3 new tasks (Midday, LeaveHouse, Claw3d) confirmed passing. 2 new tasks (SleepNudge, PhoneFree) never run yet. Downgraded from 8 to 7 until post-fix runs prove budget fixes work. |
| Metrics and feedback loop | 15 | 3 | No historical scorecard data yet. Weekly loop not yet run. |
| 24/7 operation | 15 | 2 | Ralph exists but manual. No persistent overnight worker. |
| Cross-device and integration | 10 | 5 | Obsidian synced. GWS works via Bash (but GCal and Gmail MCP need re-auth). Telegram bot LIVE (PID 87964, heartbeat fresh) but messages timeout without active Claude session. MCP cleaned. |
| CEO behavioral impact | 15 | 6 | System has caught bounced emails, sent reminders, built sites overnight. But CEO still misses ICS calls. System not yet powerful enough to override avoidance patterns. |
| Revenue generation | 15 | 7 | 20+ lead sites built, outreach automated, follow-up loop exists. Hamilton pipeline active. But zero revenue attributed directly to autonomous system actions yet. |

### Task Scheduler Audit (March 17, 2026 — Verified by AutoResearch v2)

| Task | Scheduled | Last Run | Result | Verified Status |
|------|-----------|----------|--------|-----------------|
| ClaudeCodeAutoUpdate | 5:00am daily | Mar 17 13:10 | 0 (OK) | OK |
| LifeOS-MorningBriefing | 8:30am daily | Mar 17 13:10 | 3221225786 (CRASH) | BUDGET FIXED in file (1.00) but last run was pre-fix. Log file empty. Awaiting tomorrow 8:30am validation. |
| LifeOS-EmailMonitor | 9:00am daily | Mar 17 13:10 | 3221225786 (CRASH) | BUDGET FIXED in file (0.50) but last run was pre-fix. Log file empty. Awaiting tomorrow 9:00am validation. |
| LifeOS-DeployCheck | Every 6hrs (trigger: 7am) | Mar 17 16:29 | 1 (FAIL) | BUDGET FIXED in file (0.50). Post-fix run at 16:29 still failed with code 1. No log file created for today. NEEDS INVESTIGATION — may be config/path issue beyond budget. |
| LifeOS-NightlyAccountability | 10:00pm daily | Mar 16 22:00 | 0 (OK) | OK — running consistently |
| LifeOS-WeeklyDigest | Fri 7pm | Mar 13 19:11 | 3221225786 (CRASH) | BUDGET FIXED in file (1.00). Last run was pre-fix (Mar 13). Log file empty. Next run Fri Mar 20 7pm. |
| LifeOS-WeeklyLogReminder | Sun 9am | Mar 16 09:03 | 0 (OK) | OK |
| LifeOS-SupabaseKeepAlive | Weekly | Mar 16 08:53 | 0 (OK) | OK |
| LifeOS-TelegramBot | On startup | Mar 12 11:08 | 1 (old) | Bot manually restarted at 16:23 (PID 87964). Heartbeat fresh. Network healthy. Scheduled task itself hasn't re-launched it (last ran Mar 12). |
| LifeOS-ICSReminder | 10am weekdays | Never | 267011 (never) | Registered but has never successfully triggered. DaysOfWeek=62 (Mon-Fri), Enabled=True. |
| LifeOS-SleepNudge | 11:00pm daily | Never | 267011 (never) | NEW — Trigger 23:00, DaysInterval=1. First run tonight. |
| LifeOS-PhoneFreeMorning | 7:25am daily | Never | 267011 (never) | NEW — Trigger 07:25, DaysInterval=1. First run tomorrow. |
| LifeOS-MiddayCheckin | 1:00pm daily | Mar 17 16:24 | 0 (OK) | NEW — Verified working on test run. |
| LifeOS-LeaveHouseNudge | 11:00am daily | Mar 17 16:24 | 0 (OK) | NEW — Verified working on test run. |
| LifeOS-Claw3dCheck | 9:00am daily | Mar 17 16:24 | 0 (OK) | NEW — Verified working on test run. |

**Summary:**
- 15 tasks registered (confirmed)
- 6 confirmed healthy (result 0): AutoUpdate, Nightly, WeeklyLog, Supabase, MiddayCheckin (new), LeaveHouseNudge (new), Claw3dCheck (new) = actually 7
- 4 budget-fixed but NOT yet validated by post-fix run: MorningBriefing, EmailMonitor, WeeklyDigest, DeployCheck
- DeployCheck STILL FAILING after fix (result 1 at 16:29) — needs deeper investigation
- 3 never-run tasks: ICSReminder, SleepNudge, PhoneFreeMorning
- 1 manually running outside scheduler: TelegramBot (PID 87964)

**Previous state:** 4 of 9 tasks crashing. Telegram bot dead. 5 scripts never registered.
**Current state:** 15 tasks registered. Budget fixes deployed in files. 7 confirmed passing. 4 unvalidated (fixes not yet tested by scheduler). 1 still failing post-fix. Telegram bot manually live. Autonomous layer ~55% operational (honest estimate).

### What gets us to 50% (next milestone):
1. Fix crashing tasks — budget parameter on morning briefing, email monitor, weekly digest
2. Restart Telegram bot and verify auto-restart works
3. Register the 5 missing scripts in Task Scheduler
4. Run the metrics scorecard for 7 consecutive days
5. Complete first weekly auto-research analysis
6. Wire Google Workspace CLI as local MCP server (survives session restarts)

### What gets us to 60%:
1. Ralph overnight worker running nightly with real task queue
2. All metrics auto-collected (sleep time from phone, screen time from Digital Wellbeing, exercise from health app)
3. System generates first autonomous revenue (lead replies converted without CEO involvement)
4. Voice interface working for delegation

### Role of Heartbeat Checks

The heartbeat checks (morning scan, evening scan) exist to **optimize the metrics and system itself**. They are the CoS equivalent of Karpathy's training loop — each heartbeat:
- Scans for changes in the environment (new emails, replies, stale items)
- Takes the single most impactful action available
- Updates tracking files
- Reports via Telegram

The heartbeats optimize the system. The metrics measure the CEO. The auto-research loop connects them — finding which system improvements actually move CEO metrics, and which are just infrastructure for infrastructure's sake.

---

This is a living document. The CoS updates it weekly. The CEO reviews and approves experiments. Everything is measured. Nothing is assumed.
