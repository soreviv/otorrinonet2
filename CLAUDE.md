# CLAUDE.md — OtorrinoNet

Guía de contexto para el asistente de IA al trabajar en este repositorio.

---

## Proyecto

Sistema clínico para el consultorio de otorrinolaringología del **Dr. Alejandro Viveros Domínguez** (CDMX). Tiene dos partes principales:

- **Sitio público** (`src/app/(public)/`) — marketing, perfil, servicios, agendado de citas en línea, consentimientos informados y páginas legales.
- **Panel interno** (`src/app/staff/`) — agenda, expediente clínico (EHR), notas, recetas, consentimientos, dashboard y configuración. Requiere sesión autenticada con 2FA.

---

## Stack tecnológico

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **Prisma 7** + **PostgreSQL** — se usa `prisma db push` (sin carpeta de migraciones en desarrollo activo)
- **Tailwind CSS v4**
- **JWT** en cookie `session` (8 h) — `verifySession()` en `src/lib/dal.ts`
- **2FA TOTP** — obligatorio para todo el personal; configuración en primer login
- **Sesiones revocables** — `sessionVersion` en `StaffUser`; incrementar para revocar
- **Rate-limit en login** — 5 intentos / 15 min → bloqueo 30 min (en memoria, `src/app/actions/auth.ts`)
- **Stripe** — pagos de la tienda; webhook en `/api/stripe/webhook`
- **Nodemailer / Resend** — emails transaccionales (recordatorio de cita 24 h antes, ticket de compra)
- **Cloudflare Turnstile** — protección del formulario público de agendado y contacto
- **Recharts** — gráficas en el dashboard
- **ntfy autoalojado** (`https://ntfy.otorrinonet.com`) — push notifications al staff (nueva cita, mensaje de contacto, nuevo pedido pagado); complementa el correo, no lo reemplaza

---

## Convenciones importantes

- **Schema Prisma**: después de agregar o modificar campos, ejecutar:
  ```bash
  npx prisma db push && npx prisma generate
  ```
- **Sitio público**: el layout `(public)/layout.tsx` es un pass-through vacío. Cada componente de `src/components/sitio-publico/` incluye `<PublicHeader>` y `<PublicFooter>` directamente.
- **`/agendar`**: usa `ssr: false` (dynamic import en `AgendarClient.tsx`) para evitar errores de hidratación con Turnstile y localStorage.
- **Rutas legales**: `/legal/*` redirigen 301 a las rutas canónicas (`/privacidad`, `/terminos`, `/cookies`, `/descargo`). No agregar nuevas referencias a `/legal/*`.
- **Configuración de clínica**: datos del doctor en `src/lib/clinic-config.ts` — se leen desde variables de entorno con fallback a la tabla `ClinicConfig` en BD.
- **Idioma del sitio**: todo el contenido público está en español (México). Mantener el mismo registro al agregar páginas o textos.
- **Commits**: mensajes en español, en imperativo, con prefijo convencional (`feat:`, `fix:`, `chore:`, `docs:`).

---

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
| `src/lib/ntfy.ts` | `sendStaffPush()` — push notifications al staff vía ntfy autoalojado (fire-and-forget) |
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
| `src/app/actions/cobros.ts` | Server Actions — registro de cobros, resumen financiero, listado |
| `src/lib/cobros-data.ts` | Catálogo de tipos de consulta y montos de honorarios |
| `src/app/api/stripe/webhook/route.ts` | Webhook Stripe — confirma pago, decrementa stock |
| `src/app/api/dgis/exportar-cex/` | API route — genera archivo de intercambio mensual SIS-CEX |
| `prisma/schema.prisma` | Schema de la base de datos |

---

## Módulos y referencias

- **Tienda en línea**: carrito (`useCarrito`), stock, Stripe, checkout.
- **Push notifications al staff (ntfy)**: servidor autoalojado, topics, integraciones en citas, contacto y pedidos.
- **Cobros (honorarios)**: catálogo de montos, modelo, server actions, UI en `/staff/cobros`.
- **Agenda — Bloqueo de fechas**: bloqueo de rangos de fechas para citas médicas.
- **Infraestructura (VPS)**: PM2, configuración de Nginx.
- **Certificación NOM-024-SSA3-2012**: estado de tracks (1, 2 y 3 completados; 4 en SGSI), reglas GIIS-B015.

---

## Pendientes conocidos

- **FIX-09**: botón flotante de WhatsApp y enlace `tel:` en el header — bloqueado hasta que el Dr. Viveros confirme su número de celular. Rellenar `phone` y `whatsapp` en `src/lib/sitio-publico-data.ts` y añadir el botón flotante en `src/app/(public)/layout.tsx`.
- **FHIR export**: endpoints individuales y bulk — requiere definir sistema receptor (laboratorio, HIS, IMSS).

