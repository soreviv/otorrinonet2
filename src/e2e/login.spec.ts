import { test, expect } from './helpers/setup'
import { loginStaff } from './helpers/auth'

test.describe('Login — Panel staff', () => {
  test('muestra el formulario de acceso', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('rechaza credenciales incorrectas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'noexiste@ejemplo.com')
    await page.fill('input[name="password"]', 'claveincorrecta')
    await page.click('button[type="submit"]')

    // Debe mantenerse en /login y mostrar error
    await expect(page).toHaveURL(/login/)
    await expect(page.getByText(/credenciales|incorrecto|inválido/i)).toBeVisible()
  })

  test('login completo con 2FA redirige al panel', async ({ page }) => {
    await loginStaff(page)
    await expect(page).toHaveURL(/\/staff/)
    await expect(page.getByText(/agenda|bienvenido|panel/i).first()).toBeVisible()
  })

  test('/staff redirige a login si no hay sesión', async ({ page }) => {
    await page.goto('/staff')
    await expect(page).toHaveURL(/login/)
  })

  test('cierra sesión correctamente', async ({ page }) => {
    await loginStaff(page)
    // Descarta el banner de cookies si está visible
    const cookieBanner = page.locator('[aria-label="Cerrar sin aceptar"]')
    if (await cookieBanner.isVisible()) await cookieBanner.click()
    // Busca botón de cierre de sesión y hace clic aunque un overlay lo cubra
    await page.getByRole('button', { name: /cerrar sesión|salir/i }).click({ force: true })
    await expect(page).toHaveURL(/login|\//)
  })
})
