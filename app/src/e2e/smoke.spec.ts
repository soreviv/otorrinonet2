import { test, expect } from '@playwright/test'

test('página principal carga correctamente', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/OtorrinoNet|Viveros/i)
})

test('página de login es accesible', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('input[name="password"]')).toBeVisible()
})

test('/staff redirige a login sin sesión', async ({ page }) => {
  await page.goto('/staff')
  await expect(page).toHaveURL(/login/)
})
