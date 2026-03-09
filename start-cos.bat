@echo off
echo.
echo  ================================================
echo   Life-OS Chief of Staff — Starting Session
echo  ================================================
echo.
echo  DAILY
echo    /morning      — Daily briefing
echo    /schedule     — Build today's schedule
echo    /calendar     — Calendar suite: HTML + PDF + slides
echo    /end-of-day   — Log and prep tomorrow
echo    /handoff      — Save context for next session
echo.
echo  ANALYSIS
echo    /blockers     — Surface all blockers
echo    /progress     — Project completion snapshot
echo    /truth        — Unfiltered reality check
echo    /money        — Financial snapshot
echo.
echo  PLANNING
echo    /weekly-plan  — Plan the week (Mondays)
echo    /prep         — Meeting prep (e.g. /prep client-name call)
echo    /review       — Code health check (e.g. /review project-name)
echo.
echo  META
echo    /commands     — Show all commands
echo.
echo  Starting Claude Code in Life-OS directory...
echo.
cd /d "%~dp0"
claude
