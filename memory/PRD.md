# PRD — OtorrinoNet (Consultorio ORL Dr. Viveros)

## Stack Tecnológico

- **Next.js 16** (App Router, React 19, TS 5)
- **Prisma 7** + **PostgreSQL** (`@prisma/adapter-pg`)
- **Tailwind CSS v4**
- **Autenticación:** JWT (`jose`) + 2FA TOTP (`otplib`) + `bcryptjs`
- **Seguridad:** Cifrado columnar AES-256-GCM (CURP, teléfono, email, dirección)
- **Captcha:** Cloudflare Turnstile en formularios públicos (agendado y contacto)
- **Emails:** Nodemailer para correos transaccionales (citas, contacto, reset password, tickets)
- **Push:** ntfy autoalojado para notificaciones instantáneas al staff
- **Facturación:** Autofactura CFDI 4.0 con Factura.com
- **Idioma y Zona Horaria:** `es-MX`, `America/Mexico_City`

---

## Design System (Fuente de verdad: `src/app/globals.css`)

- **Primary:** `sky` — botones, links, acentos, estados activos de navegación
- **Secondary:** `blue` — tags, highlights, badges secundarios
- **Neutral:** `slate` — fondos, texto, bordes, tarjetas (clases directas)
- **Fuentes:** DM Sans (headings), Inter (body/sans), IBM Plex Mono (timestamps, IDs, CURP, códigos)

---

## Personas y Roles

1. **Médico (rol `medico`):** Consulta + EHR + notas SOAP + recetas + firma digital + cobros + finanzas + DGIS + administración.
2. **Recepcionista (rol `recepcionista`):** Agenda, calendario de citas, lectura básica.
3. **Enfermera (rol `enfermera`):** Agenda, captura de signos vitales, somatometría y notas.
4. **Paciente (sitio público):** Agenda cita en 3 pasos, recibe confirmación y token por correo, modifica/cancela cita, compra en tienda, genera autofactura.

---

## Estructura de Rutas

- `/(public)/*` — Sitio web del consultorio (`/`, `/perfil`, `/servicios`, `/ubicacion`, `/contacto`, `/tienda`, `/autofactura`)
- `/(public)/agendar` — Formulario de cita en 3 pasos con Turnstile
- `/(public)/cita/modificar` y `/(public)/cita/cancelar` — Gestión de cita por token
- `/login` + `/login/setup-2fa` + `/login/verify-2fa` — Flujo de autenticación con 2FA
- `/staff/agenda` `/staff/ehr` `/staff/notas` `/staff/tienda` `/staff/cobros` `/staff/dashboard` `/staff/configuracion` `/staff/admin` `/staff/dgis` — Panel interno

---

## Módulos Implementados

### 1. Sitio Público y Citas
- [x] **Sitio público completo:** `/`, `/perfil`, `/servicios`, `/ubicacion`, `/contacto`.
- [x] `PublicHeader.tsx` y `PublicFooter.tsx` compartidos con navegación accesible.
- [x] Páginas legales con `LegalPageShell.tsx` (`/privacidad`, `/terminos`, `/cookies`, `/descargo`).
- [x] Banner de cookies con Google Analytics 4 Consent Mode v2.
- [x] Agendado en 3 pasos con cálculo de disponibilidad real en tiempo real.
- [x] Creación automática de expediente (`Patient`) si el correo no existe.
- [x] Modificación y cancelación de cita por el paciente mediante token seguro.
- [x] Cron de recordatorio de cita 24 h antes (`/api/cron/reminder`).
- [x] Reseñas automáticas de Google Places y cron NPS post-consulta (`/api/cron/nps`).

### 2. Tienda Médica y Facturación
- [x] Catálogo de productos ORL con categorías y control de inventario.
- [x] Carrito persistente en `localStorage` (`useCarrito`).
- [x] Checkout seguro con Stripe Elements y webhook idempotente.
- [x] Decremento de stock exclusivo ante `payment_intent.succeeded`.
- [x] Autofacturación electrónica CFDI 4.0 integrada con Factura.com (`/autofactura`).
- [x] Panel staff para administración de productos y pedidos (`/staff/tienda`).

### 3. Expediente Clínico (EHR) y Notas
- [x] Expediente clínico estructurado bajo norma **NOM-004-SSA3-2012**.
- [x] Campos de datos mínimos de identificación de paciente (**NOM-024 Track 1**).
- [x] Catálogo y buscador de diagnósticos CIE-10 (**NOM-024 Track 2**).
- [x] Notas SOAP con somatometría y signos vitales completos (**NOM-024 Track 3**).
- [x] Firma electrónica SHA-256 en notas de evolución y recetas con inmutabilidad y foliado de adendas.
- [x] Generador de archivo de intercambio mensual SIS-CEX GIIS-B015 (`/api/dgis/exportar-cex` y `/staff/dgis`).

### 4. Finanzas y Cobros
- [x] Módulo de cobros activo en `/staff/cobros` (registro manual de honorarios por cita, métodos de pago, notas extra).
- [x] Resumen financiero en tiempo real y exportación de cobros en formato CSV.

### 5. Seguridad y Control de Acceso
- [x] Rate-limit y lockout en login y password reset (5 intentos / 15 min → bloqueo 30 min).
- [x] Sesiones server-side revocables mediante `sessionVersion`.
- [x] 2FA TOTP obligatorio para todo el personal.
- [x] Cifrado columnar AES-256-GCM para datos de pacientes (`src/lib/crypto.ts`).
- [x] Escape HTML sistemático con función `esc()` en `src/lib/mailer.ts`.
- [x] Bitácora inmutable de auditoría para accesos y modificaciones clínicas.

---

## Suite de Pruebas Automatizadas

Frameworks: **Vitest** (unitarias) + **Playwright** (E2E).

### Tests Unitarios (Vitest) — 113 tests en verde

| Suite / Archivo | Tests | Cobertura / Propósito |
|---|---|---|
| `src/__tests__/schemas/tienda.test.ts` | 7 | Validación Zod de schemas de tienda y checkout |
| `src/__tests__/lib/mailer.test.ts` | 5 | Función `esc()` y sanitización de templates HTML |
| `src/__tests__/lib/giis-b015.test.ts` | 28 | Generador GIIS-B015 SIS-CEX y reglas DGIS |
| `src/__tests__/lib/crypto.test.ts` | 11 | Cifrado/descifrado AES-256-GCM de datos sensibles |
| `src/__tests__/lib/turnstile.test.ts` | 8 | Validación de tokens y hostnames de Cloudflare Turnstile |
| `src/__tests__/hooks/useCarrito.test.ts` | 8 | Manejo de estado de carrito y persistencia `localStorage` |
| `src/__tests__/actions/appointments.test.ts` | 16 | Disponibilidad de slots, bloqueos y reagendamiento |
| `src/__tests__/actions/auth.test.ts` | 18 | Rate-limiting, lockout, password reset y sessionVersion |
| `src/__tests__/api/stripe-webhook.test.ts` | 12 | Verificación HMAC, idempotencia y stock de órdenes |
| **Total Vitest** | **113** | **100% pasando** |

### Tests E2E (Playwright) — 10 tests en verde

| Suite / Archivo | Tests | Cobertura |
|---|---|---|
| `src/e2e/smoke.spec.ts` | 3 | Carga de páginas públicas |
| `src/e2e/login.spec.ts` | 5 | Autenticación 2FA completa y guard `/staff` |
| `src/e2e/agendar.spec.ts` | 2 | Flujo del formulario de citas |
| **Total Playwright** | **10** | **100% pasando** |

---

## Roadmap y Pendientes

- [ ] **FIX-09:** Botón flotante de WhatsApp en header — bloqueado hasta confirmación de número definitivo del Dr. Viveros.
- [ ] **NOM-024 Track 4:** GIIS-A004 SGSI (11 dominios ISO 27799 / Declaración de Aplicabilidad DDA). Requiere periodo de madurez de 6 meses.
- [ ] **HL7-FHIR R4:** Endpoints de interoperabilidad clínica individual y bulk (pendiente definición de receptor).
- [ ] **Telemedicina:** Integración futura de videoconsultas (Daily.co) — largo plazo.
- [ ] **Portal del Paciente:** Login autenticado para pacientes con historial de recetas — largo plazo.

