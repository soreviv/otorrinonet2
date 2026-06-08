import { Page } from '@playwright/test'
import { authenticator } from 'otplib'

export async function loginStaff(page: Page) {
  const email = process.env.E2E_STAFF_EMAIL!
  const password = process.env.E2E_STAFF_PASSWORD!
  const totpSecret = process.env.E2E_STAFF_TOTP_SECRET!

  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')

  // Pantalla de 2FA — el campo se llama "code" en /login/verify-2fa
  await page.waitForURL(/verify-2fa/)
  const token = authenticator.generate(totpSecret)
  await page.fill('input[name="code"]', token)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/staff/, { timeout: 10000 })
}
