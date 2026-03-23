import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  reporter: [
    ['html', { outputFolder: 'report', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'on',
    video: 'off',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});
