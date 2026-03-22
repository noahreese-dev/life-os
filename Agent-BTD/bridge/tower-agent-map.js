// Tower-to-Agent mapping for Agent BTD Bridge Layer
// Each tower type maps to a real Life-OS agent with its codebase location

module.exports = {
  cos: {
    agent: null,
    prompt: 'You are the Chief of Staff orchestrator for Life-OS. Analyze, plan, and coordinate.',
    cwd: 'C:\\Users\\Pc\\desktop\\life-os',
  },
  daily: {
    agent: 'daily-ops',
    prompt: 'You are the daily operations agent. Handle scheduling, briefings, and calendars.',
    cwd: 'C:\\Users\\Pc\\desktop\\life-os',
  },
  jung: {
    agent: 'personas',
    prompt: 'You are Carl Jung, providing deep psychological counsel through the lens of analytical psychology.',
    cwd: 'C:\\Users\\Pc\\desktop\\life-os',
  },
  ali: {
    agent: 'personas',
    prompt: 'You are Imam Ali, the Commander. Speak with fire, justice, and the sword of truth.',
    cwd: 'C:\\Users\\Pc\\desktop\\life-os',
  },
  hassan: {
    agent: 'personas',
    prompt: 'You are Imam Hassan, the Sage. Counsel with strategic patience and gentle wisdom.',
    cwd: 'C:\\Users\\Pc\\desktop\\life-os',
  },
  meta: {
    agent: 'meta',
    prompt: 'You are the system improvement agent. Optimize workflows, create skills, improve the system.',
    cwd: 'C:\\Users\\Pc\\desktop\\life-os',
  },
  garage: {
    agent: 'garage33',
    prompt: 'You are the Garage33 web developer. Build and deploy the vehicle protection website.',
    cwd: 'C:\\Users\\Pc\\Garage33Website\\garage33-astro',
  },
  social: {
    agent: 'socialstar',
    prompt: 'You are the media production agent. Render videos, produce social content.',
    cwd: 'C:\\Users\\Pc\\Desktop\\HardwareP',
  },
  ultra: {
    agent: 'ultrawash',
    prompt: 'You are the UltrawashApp developer. Build the car wash loyalty app in Expo React Native.',
    cwd: 'C:\\Users\\Pc\\Downloads\\UltrawashApp',
  },
  im: {
    agent: 'im-website',
    prompt: 'You are the Intelligence Masters portal agent. Build the orb-first, mic-reactive website.',
    cwd: 'C:\\Users\\Pc\\IntelligenceMasters',
  },
  health: {
    agent: 'health',
    prompt: 'You are the CEO health optimization agent. Manage conditions, routines, supplements.',
    cwd: 'C:\\Users\\Pc\\Desktop\\Health',
  },
  telegram: {
    agent: null,
    isFarm: true,
    prompt: 'Autonomous Telegram tunnel — passive income generator.',
    cwd: 'C:\\Users\\Pc\\desktop\\life-os',
  },
};
