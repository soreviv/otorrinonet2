# PRD — otorrinonet (Consultorio ORL Dr. Viveros)

## Stack
- Next.js 16 (App Router, React 19, TS 5)
- Prisma 7 + PostgreSQL (adapter pg)
- Tailwind v4
- Auth: JWT (jose) + 2FA TOTP (otplib) + bcryptjs
- Cifrado columnar AES-256-GCM (CURP, teléfono, email, dirección)
- Cloudflare Turnstile en formularios públicos
- nodemailer para emails (citas, contacto, reset password)
- Idioma: es-MX, zona horaria America/Mexico_City

## Design System (fuente de verdad: `app/src/app/globals.css`)
- **Primary:** `sky` — botones, links, acentos, estados activos de nav
- **Secondary:** `blue` — tags, highlights, badges secundarios
- **Neutral:** `slate` — fondos, texto, bordes, tarjetas (sin alias, clases directas)
- **Fuentes:** DM Sans (headings), Inter (body/sans), IBM Plex Mono (timestamps, IDs, CURP, códigos)
- Nota: `product-plan/design-system/` documenta teal/sky/slate — está desactualizado, ignorar

## Personas
1. Médico (rol `medico`): consulta + EHR + recetas + firma + admin
2. Recepcionista: agenda, lectura básica
3. Enfermera: agenda, signos vitales
4. Paciente (sitio público): agenda cita, recibe correo, confirma/cancela

## Estructura de rutas
- `/(public)/*` — sitio web del consultorio
- `/(public)/agendar` — formulario de cita en 3 pasos con Turnstile
- `/login` + `/login/setup-2fa` + `/login/verify-2fa`
- `/staff/agenda` `/staff/ehr` `/staff/notas` `/staff/configuracion` `/staff/admin`

## Última actualización: 2026-05-09

## Implementado en esta iteración (2026-01-05)

### Diagnóstico técnico (entregado en chat al usuario)
- Reporte completo: bloqueantes, altos, medios, oportunidades de negocio
- Foco en: agendar cita, creación pacientes/notas

### Configuración del consultorio (panel admin)
- Tab **Establecimiento**: nombre, COFEPRIS, dirección, teléfono, email, **logo del consultorio**
- Tab **Médico** (separado): nombre, cédula profesional, **cédula de especialidad**,
  universidad, **escudo de la universidad**
- Componente `LogoUploader` reutilizable (PNG/JPG/WEBP/SVG ≤ 200 KB → data URL)
- Validación de tamaño y MIME tipo en cliente y servidor
- Campos persistidos en `clinic_config` con migración SQL en
  `prisma/migrations/20260105_add_logos_and_email/migration.sql`
  (columnas: `clinicEmail`, `clinicLogoUrl`, `doctorUniversityLogoUrl`)
- Recetas impresas ahora muestran logo del consultorio en encabezado y escudo
  universidad junto a las cédulas (ver `lib/print-prescription.ts`)

### Firma legal de notas + adendums (NOM-004 / NOM-024 / NOM-151)
- Nuevo componente `EvolutionNoteDetail.tsx`
  - Vista de la nota original (S/O/A/P)
  - Botón **"Firmar nota electrónicamente"** con confirmación de doble click
  - Al firmar: timestamp ISO + zona horaria CDMX, hash SHA-256, autor,
    `firmada=true`, registro en bitácora con `details.firmaHash`
  - Una vez firmada → la nota queda **read-only** (UI + servidor)
  - Banner verde con sello legal: autor, fecha en formato largo CDMX y hash
- Server actions endurecidas:
  - `updateEvolutionNote(id, data)` — bloquea si `firmada=true`,
    requiere rol `medico`
  - `signEvolutionNoteInDB(id)` — devuelve `EvolutionNote` completa,
    requiere rol `medico`, idempotencia (rechaza re-firma)
  - `createAddendum(noteId, contenido)` — solo en notas firmadas, mínimo 5
    máx 5000 caracteres, hash SHA-256 propio por adendum
- UI de adendums dentro de la misma vista, listado cronológico, autor + fecha
  legal CDMX + hash de cada uno

### Quick wins de hardening
- Instalado `zod` (faltaba en `dependencies`, solo aparecía como peer dep)
- Añadido `postinstall: prisma generate` en `package.json`
- Eliminado código muerto: `src/lib/notas-data.ts` y `createSurgicalNote`
  con tipos no resolubles (rompía `tsc`)

## Validaciones
- ✓ `tsc --noEmit` pasa sin errores
- ✓ Lint sin errores nuevos (solo warnings y 1 error preexistentes en archivos
  no tocados por esta iteración)

## Decisiones de arquitectura y artefactos

### product-plan/ — carpeta de documentación de diseño
- **No es código funcional**: ningún archivo de `product-plan/` es importado por la app
- **Contenido**: 76 archivos / 2.5 MB — specs de secciones, componentes React de referencia,
  tokens de diseño (documentación), data shapes TypeScript, instrucciones de implementación,
  capturas de pantalla de referencia (15 PNGs)
- **Puede moverse fuera del repo** sin afectar el funcionamiento del proyecto
- Recomendación: moverlo a un repo privado separado (ej. `otorrinonet2-design`) o
  a un branch `design-docs` si se prefiere mantener historial conjunto

## Implementado (2026-05-07 → 2026-05-09)

### Fixes sitio público (sprint completo)
- [x] **FIX-03** `PublicHeader.tsx` compartido en `src/components/sitio-publico/` — nav extraído de todas las páginas, `usePathname` + `aria-current`, aria hamburguesa, "Agendar Cita" como `<Link>`
- [x] **FIX-01** `src/app/not-found.tsx` con PublicHeader + PublicFooter + CTAs a `/`, `/servicios`, `/agendar`
- [x] **FIX-02** Redirects 301 en `next.config.ts`: `/legal/*` → canónicas; referencias internas limpias
- [x] **FIX-05/06/07/13** Incluidos en FIX-03 (Link, aria-label/expanded/controls, aria-current)
- [x] **FIX-08** PublicHeader + PublicFooter añadido a `/privacidad`, `/terminos`, `/cookies`, `/descargo`
- [x] **FIX-11** Metadata (title, description, canonical) en todas las `page.tsx` de `(public)/`
- [x] **FIX-12** `Breadcrumbs.tsx` con JSON-LD `BreadcrumbList` en `/perfil`, `/servicios`, `/vacunacion` y páginas legales
- [x] **FIX-14** Script acceptrics eliminado de `src/app/layout.tsx`
- [x] **FIX-10** Footer: columna "Navegación" (lg:grid-cols-4) + iconos redes sociales (@drviverosorl)
- [x] **FIX-15** CookieBanner robusto: `useState→useEffect` (sin hydration mismatch), expiración 12 meses
- [x] GA4 Consent Mode v2 activado; `CookieBanner` integrado en root layout
- [x] `LegalPageShell` + `prose-lg` en páginas legales para mejor legibilidad
- [x] Polyfills innecesarios eliminados (Array.prototype.at, Object.hasOwn, flatMap, etc. — ~14 KiB Lighthouse)
- [x] xlsx eliminado; vulnerabilidad hono corregida
- **Pendiente FIX-09**: botón flotante WhatsApp — bloqueado, el Dr. Viveros no tiene número celular definitivo aún

### Panel admin — establecimiento y configuración
- [x] Dashboard admin muestra datos reales del establecimiento (`AdminDashboard.tsx` — commit f61cd2d)
- [x] **Bloqueo de fechas**: tab en `ConfiguracionClient` para marcar días no disponibles en el calendario de citas; acción `blockedDates` en `actions/configuracion.ts`
- [x] **Datos legales del médico**: campos adicionales en tab Médico (cedula especialidad, universidad, escudo)

### Flujo de citas — mejoras al portal
- [x] **Expediente automático**: al agendar cita desde el portal, se crea automáticamente un registro `Patient` si el correo no existe (`actions/appointments.ts` — commit f56a31f)
- [x] **Modificación de cita por el paciente**: enlace de "modificar cita" en el correo de confirmación → `/cita/modificar?token=…` → formulario `ModificarCitaForm.tsx` → página de éxito `/cita-modificada`; acción `rescheduleCita` en `actions/appointments.ts` (commit 7763d82)

### Reseñas y NPS (P2 completado)
- [x] **Google Places reviews**: `src/lib/google-places.ts` — fetch y caché de reseñas; campos `googleReviewsJson`, `googleReviewsCachedAt` en `clinic_config`; endpoint `/api/reviews/refresh`; reseñas mostradas en página principal
- [x] **Email NPS post-consulta**: cron `/api/cron/nps` — envía encuesta NPS por email después de la cita; campo `npsSentAt` en schema; configuración de Google Places ID en tab Configuración
- [x] `.env.example` actualizado con `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`, `CRON_SECRET`

### Seguridad
- [x] `fast-uri` actualizado para corregir CVEs de path traversal y host confusion (commit eb201e4)

## Backlog priorizado (P0) — resuelto 2026-05-07
- [x] Cifrado en producción lanza `Error` si faltan `ENCRYPTION_KEY`/`ENCRYPTION_KDF_SALT`
      (`lib/crypto.ts`)
- [x] Validación servidor de citas: Zod + fecha no en pasado (CDMX -06:00) + feriados +
      slot no tomado (`actions/appointments.ts`)
- [x] Confirm/cancel cita: GET reemplazado por páginas de confirmación visual con form POST
      (`(public)/cita/confirmar` y `(public)/cita/cancelar`); mailer actualizado;
      API route `/api/appointment/[action]` eliminado
- [x] Captura `nombre/apellidoPaterno/apellidoMaterno` separados — ya estaba implementado,
      verificado en `PatientForm.tsx`
- [x] `requireMedico()` en `savePatient`, `deletePatient` (`actions/ehr.ts`) y
      `createPrescription` (`actions/notas.ts`)
- [x] Borrado lógico: `deletePatient` actualiza `status='inactivo'` en lugar de borrar;
      listados filtran `status='activo'` (`actions/ehr.ts`)
- [x] Seed lee passwords de `SEED_PASSWORD_MEDICO/RECEPCIONISTA/ENFERMERA`; sin env →
      contraseña temporal + `mustChangePassword=true`; migración
      `20260507_add_must_change_password` agrega columna a `staff_users`

## Backlog P1
- [x] Rate-limit + lockout en login y password reset — `src/lib/rate-limit.ts`, 5 intentos / 15 min → bloqueo 30 min
- [x] Sesiones server-side revocables — `sessionVersion` en StaffUser + JWT; `verifySession()` valida contra BD; incrementa en reset de contraseña
- [x] Catálogo CIE-10 con seed (modelo `Cie10`, `searchCie10`, `Cie10Search.tsx`, `import-cie10.mjs`)
- [x] Disponibilidad real de slots respetando `appointmentDurationMin` — ventana de solapamiento en `appointments.ts`
- [x] Time-zone fix CDMX (`date-fns-tz`) — `fromZonedTime` en `appointments.ts`; `formatInTimeZone` en cron reminder
- [x] Email HTML escape de inputs — función `esc()` en `mailer.ts`, aplicada a todos los interpolados en HTML

## Backlog P2 (oportunidades)
- [x] Recordatorio por email 24 h antes de la cita — cron `POST /api/cron/reminder` (ventana 20–28 h, marca `reminderSent=true`); `sendReminderEmail` en `mailer.ts`
- [ ] Conectar `onNewOrder` / `onViewDocuments` / exports FHIR — requiere definir sistema receptor (laboratorio, HIS, IMSS, etc.)
- [ ] Telemedicina (Daily.co) — sin fecha, largo plazo
- [ ] Portal del paciente (login propio) — sin fecha, largo plazo
- [x] Reseñas y NPS automatizado (Google Places + cron email — 2026-05-09)
- [ ] ~~Triaje IA en motivo de consulta~~ — descartado
- [ ] ~~Dictado por voz + estructura SOAP (Whisper + LLM)~~ — descartado
- [ ] FHIR export individual y bulk

## Backlog Tests (completado — 2026-05-24)

Framework: **Vitest** + jsdom + `@testing-library/react` + `vitest-mock-extended`.

| Sprint | Contenido | Tests | Estado |
|--------|-----------|-------|--------|
| T0 | Instalación: `vitest.config.ts`, `setup.ts`, scripts | — | ✅ Jules |
| T1-A | Schemas Zod (`src/lib/schemas/tienda.ts`) | 7 | ✅ Jules |
| T1-B | `esc()` en `mailer.ts` | 5 | ✅ Jules |
| T1-C | `useCarrito` hook — mock localStorage | 8 | ✅ Jules |
| T2-A | Solapamiento de slots (`appointments.ts`) | 17 | ✅ Claude |
| T2-B | Rate-limit + lockout + password reset (`auth.ts`) | 18 | ✅ Claude |
| T2-C | Webhook Stripe — idempotencia + stock | 11 | ✅ Claude |
| T3 | E2E Playwright (login 2FA, agendar cita, checkout) | — | 🔲 sin fecha |
| **Total** | | **66/66** | **✅ en verde** |

## Backlog largo plazo (baja prioridad / sin fecha)
- [ ] **Módulo de cobros** — modelo `Cobro` en BD (tipoConsulta, montoTotal, metodoPago, notasExtra); formulario en panel de cita; dashboard financiero (ingresos del día/mes). Decisiones tomadas: sin Stripe, registro manual por el staff. Precios: primera vez $1,100 / subsecuente $1,000 / lavado de oídos $600. Nota aclaratoria: honorarios son por consulta; insumos extra (férulas, tapones, etc.) se cobran en consultorio y se anotan en campo libre. Descartado: pago anticipado online (baja adopción en el perfil de pacientes del consultorio).
- [ ] Facturación CFDI (Facturama)
- [ ] ~~Pago anticipado Stripe/MercadoPago~~ — descartado por baja adopción en el perfil de pacientes
