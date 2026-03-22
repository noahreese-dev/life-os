# Task Registry - Multi-Machine Coordination

> **This is the source of truth for task ownership.** Every autonomous script checks this file before running.
> To transfer a task: change the Owner column. The guard function on each machine reads this table.

## Task Assignments

| Task ID | Owner | Schedule | Status | Notes |
|---------|-------|----------|--------|-------|
| morning-briefing | atlas | Daily 8:30am | active | Primary daily briefing |
| phone-free-morning | atlas | Daily 7:25am | active | Pre-wake nudge |
| email-monitor | atlas | Every 2h 8am-8pm | active | Continuous monitoring |
| deploy-check | atlas | Every 6h | active | Site health monitoring |
| sleep-nudge | atlas | Daily 11:00pm | active | Sleep accountability |
| nightly-accountability | atlas | Daily 10:00pm | active | EOD scorecard |
| midday-checkin | atlas | Daily 1:00pm | active | Contract progress check |
| leave-house-nudge | atlas | Daily 11:00am | active | Get out of the house |
| weekly-digest | atlas | Friday 7:00pm | active | Weekly analysis |
| weekly-log-reminder | atlas | Sunday 9:00am | active | Plan the week |
| overnight-ralph | atlas | Daily 2:00am | active | Overnight autonomous worker |
| vault-project-work | atlas | On-demand | active | VeraCrypt vault work |
| heartbeat | both | Every 30 min | active | Both machines report health |
| remote-control | atlas | At login | active | Persistent RC server (Mac-Mini) |

## How to Use

- **Transfer a task**: Change the `Owner` column to `atlas`, `nomad`, `forge`, or `both`
- **Disable a task**: Change `Status` to `disabled` - script will skip on all machines
- **Add a new task**: Add a row, deploy the script, register in Task Scheduler
- **Failover**: If Atlas goes down, Nomad connects directly to claude.ai

## Machine IDs

| Username | Machine ID | Hardware | Role |
|----------|-----------|----------|------|
| Pc | atlas | Mac Mini (macOS side) | Same machine, Boot Camp |
| noahreese | atlas | Mac Mini (Windows Boot Camp) | Primary workhorse |
