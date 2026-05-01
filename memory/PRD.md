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

## Backlog priorizado (P0)
- [ ] Cifrado en producción debe lanzar error si faltan `ENCRYPTION_KEY` /
      `ENCRYPTION_KDF_SALT` (actualmente cae a clave determinística pública)
- [ ] Validación servidor del payload de citas (Zod + verificación de slot
      libre + horarios reales + no en pasado + feriados)
- [ ] Confirm/cancel cita por email: cambiar GET por POST con confirmación
      visual (los pre-fetchers de Outlook/Defender disparan la acción hoy)
- [ ] Captura `Patient.nombre/apellidoPaterno/apellidoMaterno` por separado
      (split actual por espacios rompe nombres compuestos mexicanos)
- [ ] `requireMedico()` en `savePatient`, `deletePatient`, `createPrescription`
- [ ] Borrado lógico de paciente (NOM-004, retención 5 años)
- [ ] Seed: passwords desde env + flag `mustChangePassword`

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
