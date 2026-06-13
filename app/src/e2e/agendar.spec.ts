import { test, expect } from './helpers/setup'

test.describe('Agendar cita — Sitio público', () => {
  test('carga la página de agendado', async ({ page }) => {
    await page.goto('/agendar')
    await expect(page).toHaveURL(/agendar/)
    await expect(page.getByRole('heading', { name: /agendar|cita|fecha/i }).first()).toBeVisible()
  })

  test('paso 0→1: seleccionar fecha y hora, avanzar a datos del paciente', async ({ page }) => {
    await page.goto('/agendar')

    // Esperar a que el calendario custom cargue
    await page.waitForSelector('[role="grid"][aria-label="Calendario"]', { timeout: 10000 })

    // Clic en el primer día habilitado
    const firstAvailableDay = page
      .locator('[role="grid"][aria-label="Calendario"] button[role="gridcell"]:not([disabled])')
      .first()
    await firstAvailableDay.click()

    // Seleccionar primer horario disponible
    const firstSlot = page
      .locator('[role="group"][aria-label="Horarios"] button')
      .first()
    await firstSlot.click()

    // Avanzar al paso 2 (datos del paciente)
    await page.getByRole('button', { name: 'Siguiente', exact: true }).click()

    // El formulario de datos del paciente debe cargarse
    await expect(page.locator('#patientNombre')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
  })
})
