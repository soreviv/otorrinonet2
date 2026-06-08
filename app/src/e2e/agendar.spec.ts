import { test, expect } from '@playwright/test'

test.describe('Agendar cita — Sitio público', () => {
  test('carga la página de agendado', async ({ page }) => {
    await page.goto('/agendar')
    await expect(page).toHaveURL(/agendar/)
    // El calendario o algún elemento del paso 1 debe ser visible
    await expect(page.getByRole('heading', { name: /agendar|cita|fecha/i }).first()).toBeVisible()
  })

  test('flujo completo: seleccionar fecha → datos → confirmar', async ({ page }) => {
    await page.goto('/agendar')

    // --- Paso 1: seleccionar una fecha disponible ---
    // Esperar a que el calendario cargue
    await page.waitForSelector('[data-testid="calendar"], button[aria-label*="202"], .fc-daygrid-day', {
      timeout: 10000,
    })

    // Clic en el primer día habilitado del calendario (no deshabilitado)
    const firstAvailableDay = page
      .locator('button:not([disabled])[aria-label*="202"]')
      .first()
    await firstAvailableDay.click()

    // Seleccionar primer horario disponible
    const firstSlot = page.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}:\d{2}/ }).first()
    await firstSlot.click()

    // Avanzar al paso 2
    await page.getByRole('button', { name: /siguiente|continuar/i }).click()

    // --- Paso 2: datos del paciente ---
    await page.fill('#patientNombre', 'Paciente')
    await page.fill('#patientApellidoPaterno', 'Prueba')
    await page.fill('#patientApellidoMaterno', 'E2E')
    await page.fill('#phone', '5512345678')
    await page.fill('#email', 'paciente.prueba@test.com')
    await page.fill('#reason', 'Consulta de prueba automatizada E2E — no es una cita real')

    // Avanzar al paso 3
    await page.getByRole('button', { name: /siguiente|continuar/i }).click()

    // --- Paso 3: confirmación ---
    // Debe aparecer resumen con los datos ingresados
    await expect(page.getByText(/Paciente|prueba/i).first()).toBeVisible()

    // Enviar (con Turnstile bypass)
    await page.getByRole('button', { name: /confirmar|enviar/i }).click()

    // Debe mostrar mensaje de éxito
    await expect(page.getByText(/solicitud.*recib|confirmad|gracias/i)).toBeVisible({ timeout: 15000 })
  })
})
