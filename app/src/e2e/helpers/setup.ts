import { test as base } from '@playwright/test'

// Pre-acepta el banner de cookies para que no intercepte clics en los tests
export const test = base.extend({
  page: async ({ page }, runTest) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'cookie-consent',
        JSON.stringify({ analytics: false, marketing: false, savedAt: Date.now() }),
      )
    })
    await runTest(page)
  },
})

export { expect } from '@playwright/test'
