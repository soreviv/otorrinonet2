# OtorrinoNet — Aplicación Next.js

Sistema clínico para el consultorio de otorrinolaringología del **Dr. Alejandro Viveros Domínguez** (CDMX). Incluye sitio público con agendado de citas en línea, tienda de productos médicos y panel interno para gestión clínica.

## Stack

- **Next.js 16** (App Router, React 19)
- **Prisma 7** + **PostgreSQL** (sin carpeta `migrations` — se usa `db push`)
- **Tailwind CSS 4**
- **JWT** en cookie `session` (8 h) + sesiones server-side revocables (`sessionVersion`)
- **2FA TOTP** — Google Authenticator / Authy (obligatorio para el personal)
- **Stripe** — pagos de la tienda en línea (webhooks, PaymentIntents)
- **Nodemailer / Resend** — recordatorio de cita 24 h antes + ticket de compra
- **Cloudflare Turnstile** — protección del formulario público
- **Recharts** — gráficas en el dashboard

## Desarrollo

```bash
npm install
cp .env.example .env   # completar variables (ver tabla abajo)
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
| `npx prisma db push` | Sincronizar schema Prisma con la BD |
| `npx prisma generate` | Regenerar cliente Prisma |
| `npm run db:seed` | Cargar datos iniciales |
| `npm run db:studio` | Prisma Studio |

## Estructura

```
src/
├── app/
│   ├── (public)/          # Sitio público (/, /perfil, /servicios, /agendar, /tienda, etc.)
│   ├── staff/             # Panel clínico interno (requiere sesión + 2FA)
│   │   └── tienda/        # Admin de productos, pedidos y estadísticas
│   ├── login/             # Autenticación (email+pass → 2FA → session)
│   ├── actions/           # Server Actions (agenda, ehr, notas, tienda, auth…)
│   └── api/               # API routes (stripe/webhook, cron/reminder, csp-report)
├── components/
│   ├── sitio-publico/     # Header, Footer, páginas públicas, Breadcrumbs
│   ├── agenda/            # Formulario de agendado multi-paso
│   ├── tienda/            # Carrito, checkout, catálogo, GaleriaProducto (cliente)
│   ├── notas/             # Notas de evolución, recetas, consentimientos
│   └── dashboard/         # Gráficas del panel interno
└── lib/
    ├── dal.ts             # verifySession() — auth y acceso a datos
    ├── clinic-config.ts   # Configuración del doctor/clínica (env + BD)
    ├── stripe.ts          # Cliente Stripe server-side (lazy init)
    ├── stripe-client.ts   # stripePromise para Stripe Elements
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
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe (`pk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe (`whsec_…`) |
| `TIENDA_COSTO_ENVIO_CENTAVOS` | Costo de envío en centavos MXN (default: 15000 = $150) |

## Notas importantes

- Al agregar un campo al schema de Prisma ejecutar `npx prisma db push && npx prisma generate`.
- El módulo `(public)/layout.tsx` es un pass-through; cada componente de sitio público incluye `<PublicHeader>` y `<PublicFooter>` directamente.
- La ruta `/agendar` usa `ssr: false` (dynamic import) para evitar errores de hidratación con Turnstile.
- Las rutas `/legal/*` redirigen 301 a sus equivalentes canónicas (`/privacidad`, `/terminos`, `/cookies`, `/descargo`).
- El stock de productos se decrementa **solo** en el webhook `payment_intent.succeeded`, nunca al crear la orden.
- El carrito de la tienda vive en `localStorage` (hook `useCarrito`), no en BD ni cookies.
- Las imágenes de la tienda usan `next/image` con `fill` + `sizes` para optimización automática (WebP, lazy loading, srcset). La galería del detalle de producto (`GaleriaProducto`) es un componente cliente que permite cambiar la imagen principal haciendo clic en las miniaturas.

## Infraestructura (VPS)

- **PM2**: proceso `otorrinonet` — `npm run start -- -p 5000` en `/var/www/otorrinonet2/app`
- **nginx**: config activa en `/etc/nginx/conf.d/otorrinonet.conf` (no en `sites-enabled/`)
  - `/_next/static/` se sirve directamente desde disco (alias a `.next/static/`)
  - `/assets/` se sirve directamente desde `public/`
  - Todo lo demás se proxea a `127.0.0.1:5000`
