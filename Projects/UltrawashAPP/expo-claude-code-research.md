# Expo + Claude Code Research -- From @baconbrix (Evan Bacon)

> Source: https://x.com/baconbrix/status/2031402262808125675
> Saved: March 22, 2026

## Key Finds

### 1. Evan Bacon's Claude Code + Expo Workflow
- Create local Expo module: `npx create-expo-module --local`
- Add CLAUDE.md to modules folder for agent context
- Swift integration via Expo modules -- Claude Code can write native iOS code through this pattern
- Source: https://x.com/Baconbrix/status/1982180394297393257

### 2. CSS Grid Coming to Expo (HUGE)
- PR going into Yoga (React Native layout engine)
- Enables universal design systems, tablet support, shadcn on native
- Affects React Native, React Ink (Claude Code CLI), Satori (OG images)
- This means UltrawashAPP can use CSS Grid for responsive layouts natively

### 3. Claude Code React Native/Expo Agent System
- GitHub: https://github.com/senaiverse/claude-code-reactnative-expo-agent-system
- 7 production agents for React Native/Expo:
  - Accessibility agent
  - Design system agent
  - Security agent
  - Performance agent
  - Testing agent
- Built for Claude Code v2.0.5+
- **DIRECTLY APPLICABLE to UltrawashAPP development**

### 4. Expo Toolkit Plugin
- GitHub: https://github.com/rahulkeerthi/expo-toolkit
- Comprehensive Claude Code plugin for React Native Expo
- Covers: project init through app store submission and maintenance
- Full development lifecycle automated

## Action Items for UltrawashAPP
- [ ] Install the expo agent system: clone senaiverse/claude-code-reactnative-expo-agent-system
- [ ] Install expo-toolkit plugin for Claude Code
- [ ] Use Evan Bacon's CLAUDE.md pattern for native module development
- [ ] Watch for CSS Grid in Expo -- will simplify UltrawashAPP responsive layouts
