import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4173/api/health',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
