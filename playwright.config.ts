import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: process.env.DC_BASE_URL || 'https://www.death-clock.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'webkit-desktop',   use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } } },
    { name: 'firefox-desktop',  use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile-iphone-se', use: { ...devices['iPhone SE'] } }
  ]
});
