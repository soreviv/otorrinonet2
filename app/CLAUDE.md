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
- **Nodemailer / Resend** — emails transaccionales (recordatorio de cita 24 h antes)
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
| `src/components/sitio-publico/PublicHeader.tsx` | Header compartido del sitio público |
| `src/components/sitio-publico/PublicFooter.tsx` | Footer compartido del sitio público |
| `src/app/(public)/layout.tsx` | Layout público (pass-through) |
| `src/app/staff/layout.tsx` | Layout del panel interno (async, verifica sesión) |
| `src/app/actions/appointments.ts` | Server Action — agendado de citas |
| `prisma/schema.prisma` | Schema de la base de datos |

## Pendientes conocidos

- **FIX-09**: botón flotante de WhatsApp y enlace `tel:` en el header — bloqueado hasta que el Dr. Viveros confirme su número de celular. Rellenar `phone` y `whatsapp` en `src/lib/sitio-publico-data.ts` y añadir el botón flotante en `src/app/(public)/layout.tsx`.
