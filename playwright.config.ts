import { defineConfig, devices } from '@playwright/test'
import { config as dotenv } from 'dotenv'

// Carga .env.e2e si existe (variables específicas de pruebas E2E)
dotenv({ path: '.env.e2e', override: false })
// Carga .env como fallback para variables compartidas (DB, etc.)
dotenv({ path: '.env', override: false })

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
