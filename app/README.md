# OtorrinoNet — Aplicación Next.js

Sistema clínico para el consultorio de otorrinolaringología del **Dr. Alejandro Viveros Domínguez** (CDMX). Incluye sitio público con agendado de citas en línea y panel interno para gestión clínica.

## Stack

- **Next.js 16** (App Router, React 19)
- **Prisma 7** + **PostgreSQL** (sin carpeta `migrations` — se usa `db push`)
- **Tailwind CSS 4**
- **JWT** en cookie `session` (8 h) — verificación en `src/lib/dal.ts`
- **Nodemailer** — recordatorio de cita 24 h antes
- **Cloudflare Turnstile** — protección del formulario público
- **Recharts** — gráficas en el dashboard

## Desarrollo

```bash
npm install
cp .env.example .env   # completar DATABASE_URL, JWT_SECRET, RESEND_*, TURNSTILE_*
npx prisma db push     # sincronizar schema con la BD
npm run db:seed        # datos iniciales (usuario admin)
npm run dev            # http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Sincronizar schema Prisma con la BD |
| `npm run db:seed` | Cargar datos iniciales |
| `npm run db:studio` | Prisma Studio |

## Estructura

```
src/
├── app/
│   ├── (public)/          # Sitio público (/, /perfil, /servicios, /agendar, etc.)
│   ├── (patient)/         # Rutas legacy del paciente (redirigen a canónicas)
│   ├── staff/             # Panel clínico interno (requiere sesión)
│   ├── login/             # Autenticación + 2FA
│   ├── actions/           # Server Actions (agenda, ehr, notas, configuracion…)
│   └── api/               # API routes (webhooks, cron)
├── components/
│   ├── sitio-publico/     # Header, Footer, páginas públicas, Breadcrumbs
│   ├── agenda/            # Formulario de agendado multi-paso
│   ├── notas/             # Notas de evolución, recetas, consentimientos
│   └── dashboard/         # Gráficas del panel interno
└── lib/
    ├── dal.ts             # Capa de acceso a datos + verifySession()
    ├── clinic-config.ts   # Configuración del doctor/clínica (env + BD)
    ├── routes.ts          # Rutas canónicas de la app
    └── prisma.ts          # Cliente Prisma singleton
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Secreto para firmar cookies de sesión |
| `DOCTOR_NAME` | Nombre completo del médico |
| `DOCTOR_LICENSE` | Cédula profesional |
| `DOCTOR_SPECIALTY_LICENSE` | Cédula de especialidad |
| `DOCTOR_UNIVERSITY` | Universidad de titulación |
| `CLINIC_NAME` | Nombre del consultorio |
| `CLINIC_ADDRESS` | Dirección del consultorio |
| `CLINIC_PHONE` | Teléfono del consultorio |
| `CLINIC_EMAIL` | Email de contacto |
| `CLINIC_COFEPRIS` | Licencia COFEPRIS (opcional) |
| `RESEND_API_KEY` | API key de Resend para emails |
| `TURNSTILE_SECRET` | Secreto de Cloudflare Turnstile |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key pública de Turnstile |
| `GOOGLE_PLACES_API_KEY` | API key para reseñas de Google Places |

## Notas importantes

- Al agregar un campo al schema de Prisma ejecutar `npx prisma db push && npx prisma generate`.
- El módulo `(public)/layout.tsx` es un pass-through; cada componente de sitio público incluye `<PublicHeader>` y `<PublicFooter>` directamente.
- La ruta `/agendar` usa `ssr: false` (dynamic import) para evitar errores de hidratación con Turnstile.
- Las rutas `/legal/*` redirigen 301 a sus equivalentes canónicas (`/privacidad`, `/terminos`, `/cookies`, `/descargo`).
