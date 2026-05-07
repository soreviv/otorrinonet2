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

## Última actualización: 2026-05-07

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
- [ ] Rate-limit + lockout en login y password reset
- [ ] Sesiones server-side revocables
- [ ] Catálogo CIE-10 con seed
- [ ] Disponibilidad real de slots respetando `appointmentDurationMin`
- [ ] Time-zone fix CDMX (`date-fns-tz`)
- [ ] Conectar `onNewOrder`, `onViewDocuments`, exports FHIR
- [ ] Email HTML escape de inputs

## Backlog P2 (oportunidades)
- [ ] Recordatorios WhatsApp/Email/SMS (cron `reminderSent` ya en schema)
- [ ] Pago anticipado (Stripe / MercadoPago)
- [ ] Telemedicina (Daily.co)
- [ ] Portal del paciente (login propio)
- [ ] Reseñas y NPS automatizado
- [ ] Triaje IA en motivo de consulta
- [ ] Dictado por voz + estructura SOAP (Whisper + LLM)
- [ ] Dashboard métricas clínicas/financieras
- [ ] Facturación CFDI (Facturama)
- [ ] FHIR export individual y bulk
