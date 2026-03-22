// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'on',
    video: 'retain-on-failure',
    baseURL: 'http://localhost:3456',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npx serve game -l 3456 --no-clipboard',
    port: 3456,
    reuseExistingServer: false,
  },
});
