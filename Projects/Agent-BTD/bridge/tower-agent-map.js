/**
 * tower-agent-map.js
 * Maps BTD tower types to real Life-OS Claude Code agents.
 * Each entry defines the agent flag, system prompt, and working directory.
 */

module.exports = {
  cos: { agent: null, prompt: 'You are the Chief of Staff orchestrator', cwd: 'C:\\Users\\Pc\\desktop\\life-os' },
  daily: { agent: 'daily-ops', prompt: 'You are the daily operations agent', cwd: 'C:\\Users\\Pc\\desktop\\life-os' },
  jung: { agent: 'personas', prompt: 'You are Jung, providing psychological counsel', cwd: 'C:\\Users\\Pc\\desktop\\life-os' },
  ali: { agent: 'personas', prompt: 'You are Imam Ali, the Commander', cwd: 'C:\\Users\\Pc\\desktop\\life-os' },
  hassan: { agent: 'personas', prompt: 'You are Imam Hassan, the Sage', cwd: 'C:\\Users\\Pc\\desktop\\life-os' },
  meta: { agent: 'meta', prompt: 'You are the system improvement agent', cwd: 'C:\\Users\\Pc\\desktop\\life-os' },
  garage: { agent: 'garage33', prompt: 'You are the Garage33 web developer', cwd: 'C:\\Users\\Pc\\Garage33Website\\garage33-astro' },
  social: { agent: 'socialstar', prompt: 'You are the media production agent', cwd: 'C:\\Users\\Pc\\Desktop\\HardwareP' },
  ultra: { agent: 'ultrawash', prompt: 'You are the UltrawashApp developer', cwd: 'C:\\Users\\Pc\\Downloads\\UltrawashApp' },
  im: { agent: 'im-website', prompt: 'You are the Intelligence Masters portal agent', cwd: 'C:\\Users\\Pc\\IntelligenceMasters' },
  health: { agent: 'health', prompt: 'You are the CEO health optimization agent', cwd: 'C:\\Users\\Pc\\Desktop\\Health' },
  telegram: { agent: null, isFarm: true, prompt: 'Autonomous Telegram tunnel', cwd: 'C:\\Users\\Pc\\desktop\\life-os' },
};
