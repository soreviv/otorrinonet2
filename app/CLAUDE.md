# CLAUDE.md — OtorrinoNet

Guía de contexto para el asistente de IA al trabajar en este repositorio.

## Proyecto

Sistema clínico para el consultorio de otorrinolaringología del **Dr. Alejandro Viveros Domínguez** (CDMX). Tiene dos partes:

- **Sitio público** (`src/app/(public)/`) — marketing, perfil, servicios, agendado de citas en línea, consentimientos informados y páginas legales.
- **Panel interno** (`src/app/staff/`) — agenda, expediente clínico (EHR), notas, recetas, consentimientos, dashboard y configuración. Requiere sesión.

## Stack

- **Next.js 16** App Router · **React 19** · **TypeScript 5**
- **Prisma 7** + **PostgreSQL** — se usa `prisma db push` (sin carpeta `migrations`)
- **Tailwind CSS 4**
- **JWT** en cookie `session` (8 h) — `verifySession()` en `src/lib/dal.ts`
- **2FA TOTP** — obligatorio para todo el personal; configuración en primer login
- **Sesiones revocables** — `sessionVersion` en `StaffUser`; incrementar para revocar
- **Rate-limit en login** — 5 intentos / 15 min → bloqueo 30 min (en memoria, `src/app/actions/auth.ts`)
- **Stripe** — pagos de la tienda; webhook en `/api/stripe/webhook`
- **Nodemailer / Resend** — emails transaccionales (recordatorio de cita 24 h antes, ticket de compra)
- **Cloudflare Turnstile** — protección del formulario público de agendado
- **Recharts** — gráficas en el dashboard

## Comandos de desarrollo

```bash
npm run dev           # servidor de desarrollo en http://localhost:3000
npm run build         # build de producción
npm run lint          # ESLint
npx prisma db push    # sincronizar schema con la BD (usar en lugar de migrate)
npx prisma generate   # regenerar cliente (necesario tras cambios al schema)
npm run db:seed       # datos iniciales
npm run db:studio     # Prisma Studio
```

## Convenciones importantes

- **Schema Prisma**: después de agregar un campo, ejecutar `npx prisma db push && npx prisma generate`.
- **Sitio público**: el layout `(public)/layout.tsx` es un pass-through vacío. Cada componente de `src/components/sitio-publico/` incluye `<PublicHeader>` y `<PublicFooter>` directamente.
- **`/agendar`**: usa `ssr: false` (dynamic import en `AgendarClient.tsx`) para evitar errores de hidratación con Turnstile y localStorage.
- **Rutas legales**: `/legal/*` redirigen 301 a las rutas canónicas (`/privacidad`, `/terminos`, `/cookies`, `/descargo`). No agregar nuevas referencias a `/legal/*`.
- **Configuración de clínica**: datos del doctor en `src/lib/clinic-config.ts` — se leen desde variables de entorno con fallback a la tabla `ClinicConfig` en BD.
- **Idioma del sitio**: todo el contenido público está en español (México). Mantener el mismo registro al agregar páginas o textos.
- **Commits**: mensajes en español, en imperativo, con prefijo convencional (`feat:`, `fix:`, `chore:`, `docs:`).

## Archivos clave

| Archivo | Propósito |
|---|---|
| `src/lib/dal.ts` | `verifySession()` — autenticación y capa de acceso a datos |
| `src/lib/clinic-config.ts` | Configuración del doctor/clínica |
| `src/lib/routes.ts` | Rutas canónicas de la app |
| `src/lib/sitio-publico-data.ts` | Contenido estático del sitio público |
| `src/lib/stripe.ts` | Cliente Stripe server-side (lazy init, evita error en build) |
| `src/lib/stripe-client.ts` | `stripePromise` para Stripe Elements en el browser |
| `src/lib/giis-b015.ts` | Generador del archivo de intercambio GIIS-B015 (SIS-CEX) |
| `src/lib/schemas/tienda.ts` | Schemas Zod para productos, pedidos y checkout |
| `src/hooks/useCarrito.ts` | Hook de carrito (localStorage) |
| `src/components/sitio-publico/PublicHeader.tsx` | Header compartido del sitio público |
| `src/components/sitio-publico/PublicFooter.tsx` | Footer compartido del sitio público |
| `src/app/(public)/layout.tsx` | Layout público (pass-through) |
| `src/app/(public)/autofactura/` | Autofactura CFDI 4.0 post-compra |
| `src/app/staff/layout.tsx` | Layout del panel interno (async, verifica sesión) |
| `src/app/staff/dgis/` | UI de exportación GIIS-B015 y reporte mensual |
| `src/app/actions/appointments.ts` | Server Action — agendado de citas |
| `src/app/actions/tienda.ts` | Server Actions — catálogo, stock, checkout |
| `src/app/actions/tienda-admin.ts` | Server Actions — CRUD productos y pedidos (staff) |
| `src/app/api/stripe/webhook/route.ts` | Webhook Stripe — confirma pago, decrementa stock |
| `src/app/api/dgis/exportar-cex/` | API route — genera archivo de intercambio mensual SIS-CEX |
| `prisma/schema.prisma` | Schema de la base de datos |

## Tienda en línea

- Carrito en `localStorage` via `useCarrito` — no en BD ni cookies.
- Stock se decrementa **solo** en webhook `payment_intent.succeeded`.
- Idempotencia: `StripeWebhookEvent` con PK = `event.id` de Stripe.
- Imágenes en `/public/assets/tienda/` — upload via API `/api/tienda/upload-imagen`.
- Variables de entorno requeridas: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `TIENDA_COSTO_ENVIO_CENTAVOS`.

## Agenda — Bloqueo de fechas

- El personal puede bloquear rangos de fechas (vacaciones, congresos, incapacidad) desde `/staff/agenda`.
- Modelo `AgendaBlock` en `prisma/schema.prisma`.
- El formulario público de agendado (`/agendar`) consulta los bloqueos antes de mostrar disponibilidad.

## Infraestructura (VPS)

- **PM2**: proceso `otorrinonet` — `npm run start -- -p 5000` en `/var/www/otorrinonet2/app`.
- **nginx**: config activa en `/etc/nginx/conf.d/otorrinonet.conf` (el archivo en `sites-available/` **no** es leído por nginx — `nginx.conf` solo incluye `conf.d/`).
  - `/_next/static/` → `alias` a `.next/static/` (archivos estáticos servidos desde disco, no proxeados).
  - `/assets/` → `root` en `public/`.
  - Todo lo demás → proxy a `127.0.0.1:5000`.

## Pendientes conocidos

- **FIX-09**: botón flotante de WhatsApp y enlace `tel:` en el header — bloqueado hasta que el Dr. Viveros confirme su número de celular. Rellenar `phone` y `whatsapp` en `src/lib/sitio-publico-data.ts` y añadir el botón flotante en `src/app/(public)/layout.tsx`.
- **Módulo de cobros**: registro manual de honorarios (primera vez $1,100 / subsecuente $1,000 / lavado $600) — sin fecha, decisión pendiente de scope.
- **FHIR export**: endpoints individuales y bulk — requiere definir sistema receptor (laboratorio, HIS, IMSS).

## Certificación NOM-024-SSA3-2012 (en curso)

El sistema está en proceso de certificarse como SIRES ante la DGIS (Secretaría de Salud). Ver plan completo en la memoria del proyecto.

**4 tracks de implementación:**

1. **Track 1 ✅ Implementado** — Datos mínimos del paciente: CURP, sexo CURP, sexo biológico, género, derechohabiencia, entidad de nacimiento, indicadores indígena/afromexicano/migrante en modelo `Patient`.
2. **Track 2 ✅ Implementado** — Catálogos fundamentales: CIE-10 en diagnósticos de notas clínicas, CLUES del consultorio, catálogos DGIS.
3. **Track 3 ✅ Implementado** — GIIS-B015 Consulta Externa: somatometría + signos vitales en nota clínica, generador SIS-CEX en `src/app/api/dgis/exportar-cex/`, UI en `src/app/staff/dgis/`.
4. **Track 4 🔄 En documentación** — GIIS-A004 SGSI: 11 dominios ISO 27799, Declaración de Aplicabilidad (DDA), políticas. Requiere 6 meses de madurez antes de la verificación ante DGIS.

**Reglas críticas GIIS-B015:** nombres en MAYÚSCULAS sin acentos (A-Z + Ñ). Máx 15% CURP genérica. Máx 5% diagnóstico R69X.

**Contacto DGIS:** angel.serrano@salud.gob.mx / blanca.pinette@salud.gob.mx · +52 55 6392 2300 ext. 52584

## Local OpenACP Workspace

The `.openacp/` directory contains a local OpenACP workspace with secrets (bot tokens, API keys). Do not read, commit, or reference files inside it.
