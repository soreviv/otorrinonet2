# OtorrinoNet — Plataforma de Práctica Privada ORL

Plataforma integral para la práctica privada del **Dr. Alejandro Viveros Domínguez**, especialista en Otorrinolaringología y Cirugía de Cabeza y Cuello (CDMX). Combina sitio web de presentación, agendado de citas en línea, expediente clínico electrónico (EHR) y tienda médica en línea en un solo servidor, con cumplimiento de **LFPDPPP**, **NOM-004-SSA3**, **NOM-024-SSA3** y **HL7-FHIR**.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Lenguaje | TypeScript 5 |
| ORM | Prisma 7 + PostgreSQL |
| Auth | JWT (jose) + TOTP 2FA (otplib) + bcryptjs |
| Seguridad de datos | Cifrado AES-256-GCM (node:crypto) |
| Pagos | Stripe (PaymentIntents + Webhooks) |
| Email | Nodemailer (citas, recordatorios, tickets de compra) |
| Captcha | Cloudflare Turnstile |
| Tests | Vitest + jsdom + @testing-library/react |
| Infraestructura | Node.js 20+ / PM2 / nginx / VPS |

---

## Módulos

| # | Módulo | Ruta | Descripción |
|---|---|---|---|
| 1 | **Sitio público** | `/`, `/perfil`, `/servicios`, `/ubicacion`, `/contacto` | Presentación profesional |
| 2 | **Agendado de citas** | `/agendar` | Formulario 3 pasos con Turnstile; modifica/cancela cita por token |
| 3 | **Tienda médica** | `/tienda` | Catálogo, carrito, checkout Stripe, confirmación |
| 4 | **Autofactura CFDI 4.0** | `/autofactura` | Generación de factura electrónica post-compra |
| 5 | **Expediente clínico (EHR)** | `/staff/ehr` | Historia clínica NOM-004-SSA3 con campos NOM-024 Track 1 |
| 6 | **Notas, recetas y consentimientos** | `/staff/notas` | Notas SOAP, recetas con firma SHA-256, somatometría y signos vitales |
| 7 | **Agenda staff** | `/staff/agenda` | Calendario, bloqueo de fechas |
| 8 | **Admin tienda** | `/staff/tienda` | CRUD productos, pedidos, estadísticas |
| 9 | **Dashboard** | `/staff/dashboard` | Métricas clínicas y de ventas |
| 10 | **Configuración** | `/staff/configuracion` | Datos del consultorio, logo, cédulas, bloqueos |
| 11 | **Admin** | `/staff/admin` | Usuarios, bitácora, ARCO, exportación FHIR |
| 12 | **Exportación DGIS** | `/staff/dgis` | UI para generación del archivo GIIS-B015 (SIS-CEX) |

---

## Estructura del proyecto

```
otorrinonet2/
├── app/                          # Aplicación Next.js
│   ├── prisma/
│   │   ├── schema.prisma         # Esquema de base de datos
│   │   └── seed.ts               # Datos iniciales
│   ├── vitest.config.ts          # Configuración de tests
│   └── src/
│       ├── app/
│       │   ├── (public)/         # Sitio público y tienda
│       │   ├── staff/            # Panel interno (requiere sesión + 2FA)
│       │   ├── login/            # Autenticación (email+pass → 2FA)
│       │   ├── actions/          # Server Actions
│       │   └── api/              # API routes (stripe/webhook, cron, csp-report)
│       ├── components/
│       │   ├── sitio-publico/    # Header, Footer, Breadcrumbs
│       │   ├── tienda/           # Carrito, checkout, galería
│       │   ├── ehr/              # Expediente clínico
│       │   ├── notas/            # Notas, recetas, consentimientos
│       │   └── shell/            # StaffShell (nav lateral)
│       ├── __tests__/            # Suite de tests (66/66 en verde)
│       └── lib/
│           ├── dal.ts            # verifySession()
│           ├── clinic-config.ts  # Datos del doctor/clínica
│           ├── stripe.ts         # Cliente Stripe server-side
│           ├── mailer.ts         # Emails transaccionales
│           └── prisma.ts         # Cliente Prisma singleton
├── memory/                       # PRD y plan de producto
├── .jules/                       # Instrucciones para agentes de IA
├── AGENTS.md                     # Guía para agentes de IA
└── RESUMEN_EJECUTIVO_OTORRINONET.md
```

---

## Requisitos previos

- Node.js 20+
- PostgreSQL 15+
- npm
- PM2 (producción): `npm install -g pm2`

---

## Configuración inicial (desarrollo)

```bash
cd app
npm install
cp .env.example .env        # completar variables (ver tabla abajo)
npx prisma db push          # sincronizar schema con la BD
npm run db:seed             # datos iniciales
npm run dev                 # http://localhost:3000
```

---

## Scripts

Todos los comandos se ejecutan desde `app/`.

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run test` | Suite de tests (Vitest) |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npx prisma db push` | Sincronizar schema Prisma con la BD |
| `npx prisma generate` | Regenerar cliente Prisma |
| `npm run db:seed` | Cargar datos iniciales |
| `npm run db:studio` | Prisma Studio (GUI de base de datos) |

---

## Tests

### Tests unitarios — Vitest

Framework: **Vitest** con jsdom y `@testing-library/react`. **~94 tests en verde.**

```
src/__tests__/
├── schemas/tienda.test.ts          # 7 casos — schemas Zod (checkout, carrito, dirección)
├── lib/mailer.test.ts              # 5 casos — función esc() escape HTML
├── lib/giis-b015.test.ts           # 28 casos — generador GIIS-B015 (normName, serializeRow, buildGiisFile)
├── hooks/useCarrito.test.ts        # 8 casos — carrito (localStorage, subtotal, envío)
├── actions/appointments.test.ts   # 17 casos — slots, fechas bloqueadas, reagendamiento
├── actions/auth.test.ts            # 18 casos — rate-limit, lockout, password reset
└── api/stripe-webhook.test.ts      # 11 casos — idempotencia, stock, estados de orden
```

> Usar `vi.hoisted()` para variables referenciadas dentro de factories de `vi.mock()`.

### Tests E2E — Playwright

**10/10 tests en verde.** Requieren servidor levantado en el puerto 5000.

```
src/e2e/
├── smoke.spec.ts    # 3 casos — páginas públicas básicas
├── login.spec.ts    # 5 casos — login 2FA, cierre de sesión, guard /staff
└── agendar.spec.ts  # 2 casos — carga del formulario, paso 0→1
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Secreto para firmar cookies de sesión |
| `ENCRYPTION_KEY` | Clave AES-256-GCM para cifrado de datos de pacientes |
| `ENCRYPTION_KDF_SALT` | Salt para derivación de clave |
| `DOCTOR_NAME` | Nombre completo del médico |
| `DOCTOR_LICENSE` | Cédula profesional |
| `DOCTOR_SPECIALTY_LICENSE` | Cédula de especialidad |
| `DOCTOR_UNIVERSITY` | Universidad de titulación |
| `CLINIC_NAME` | Nombre del consultorio |
| `CLINIC_ADDRESS` | Dirección del consultorio |
| `CLINIC_PHONE` | Teléfono del consultorio |
| `CLINIC_EMAIL` | Email de contacto |
| `CLINIC_COFEPRIS` | Licencia COFEPRIS (opcional) |
| `SMTP_HOST` | Servidor SMTP para emails |
| `SMTP_PORT` | Puerto SMTP |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Contraseña SMTP |
| `TURNSTILE_SECRET` | Secreto de Cloudflare Turnstile |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key pública de Turnstile |
| `GOOGLE_PLACES_API_KEY` | API key para reseñas de Google Places |
| `GOOGLE_PLACE_ID` | ID del lugar en Google Places |
| `CRON_SECRET` | Token para proteger endpoints de cron |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe (`pk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe (`whsec_…`) |
| `TIENDA_COSTO_ENVIO_CENTAVOS` | Costo de envío en centavos MXN (default: 15000 = $150) |

---

## Notas importantes

- Después de modificar `prisma/schema.prisma` ejecutar `npx prisma db push && npx prisma generate`.
- El layout `(public)/layout.tsx` es un pass-through; cada componente incluye `<PublicHeader>` y `<PublicFooter>` directamente.
- La ruta `/agendar` usa `ssr: false` (dynamic import) para evitar errores de hidratación con Turnstile.
- Las rutas `/legal/*` redirigen 301 a sus canónicas (`/privacidad`, `/terminos`, `/cookies`, `/descargo`).
- El stock se decrementa **solo** en el webhook `payment_intent.succeeded`, nunca al crear la orden.
- El carrito vive en `localStorage` (`useCarrito`), no en BD ni cookies.

---

## Despliegue en producción

```bash
cd app
npm run build
pm2 start "npm run start -- -p 5000" --name otorrinonet
pm2 save
pm2 startup
```

**Actualizar en producción:**

```bash
git pull
cd app && npm run build
pm2 restart otorrinonet
```

---

## Infraestructura (VPS)

- **PM2**: proceso `otorrinonet` — `npm run start -- -p 5000` en `/var/www/otorrinonet2/app`
- **nginx**: config activa en `/etc/nginx/conf.d/otorrinonet.conf` (no en `sites-enabled/`)
  - `/_next/static/` → alias a `.next/static/` (archivos estáticos desde disco)
  - `/assets/` → root en `public/`
  - Todo lo demás → proxy a `127.0.0.1:5000`

---

## Acceso al sistema

URL de login: `/login`. El sistema redirige según el rol tras autenticarse.

| Rol | Rutas disponibles |
|---|---|
| `medico` | Acceso completo a `/staff/*` |
| `enfermera` | `/staff/ehr` (lectura), `/staff/notas`, `/staff/agenda` |
| `recepcionista` | `/staff/agenda` |

---

## Cumplimiento normativo

| Norma | Estado |
|---|---|
| **NOM-004-SSA3** — Expediente clínico electrónico estructurado | ✅ Implementado |
| **LFPDPPP** — Aviso de privacidad, derechos ARCO, cifrado AES-256-GCM | ✅ Implementado |
| **NOM-024 Track 1** — Datos mínimos del paciente (CURP, sexo, derechohabiencia, etc.) | ✅ Implementado |
| **NOM-024 Track 2** — Catálogos fundamentales (CIE-10 en diagnósticos) | ✅ Implementado |
| **NOM-024 Track 3** — GIIS-B015 SIS Consulta Externa | ✅ Implementado (`/api/dgis/exportar-cex`, `/staff/dgis`) |
| **NOM-024 Track 4** — GIIS-A004 SGSI (ISO 27799, 11 dominios) | 🔄 En documentación (requiere 6 meses de madurez) |
| **HL7-FHIR** — Interoperabilidad estándar | ⏳ Largo plazo |

### Proceso de certificación NOM-024

La DGIS (Secretaría de Salud) certifica el sistema como SIRES mediante el **Procedimiento de Evaluación de la Conformidad (PEC)**. Los 4 aspectos evaluados son: datos mínimos de identificación, catálogos fundamentales, GIIS aplicables (GIIS-B015 para consulta externa) y el Sistema de Gestión de Seguridad de la Información (GIIS-A004).

Contacto DGIS: `angel.serrano@salud.gob.mx` · `blanca.pinette@salud.gob.mx` · Homero 213, Chapultepec Morales, CDMX.
