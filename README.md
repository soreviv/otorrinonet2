# OtorrinoNet — Plataforma de Práctica Privada ORL

Plataforma integral para la práctica privada del **Dr. Alejandro Viveros Domínguez**, especialista en Otorrinolaringología y Cirugía de Cabeza y Cuello (CDMX). Combina sitio web de presentación, agendado de citas en línea, expediente clínico electrónico (EHR) y tienda médica en línea en un solo servidor, con cumplimiento estricto de **LFPDPPP**, **NOM-004-SSA3**, **NOM-024-SSA3** y **HL7-FHIR**.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + Tailwind CSS v4 |
| **Lenguaje** | TypeScript 5 |
| **ORM** | Prisma 7 + PostgreSQL |
| **Autenticación** | JWT (`jose`) + TOTP 2FA (`otplib`) + `bcryptjs` |
| **Seguridad de datos** | Cifrado AES-256-GCM (`node:crypto`) |
| **Pagos** | Stripe (PaymentIntents + Webhooks con validación HMAC) |
| **Email** | Nodemailer (citas, recordatorios 24 h, tickets de compra) |
| **Push** | ntfy autoalojado (notificaciones al staff: nueva cita, contacto, pedido) |
| **Captcha** | Cloudflare Turnstile |
| **Tests** | Vitest + jsdom + @testing-library/react + Playwright |
| **Infraestructura** | Node.js 20+ / PM2 / Nginx / VPS |

---

## Módulos del sistema

| # | Módulo | Ruta | Descripción |
|---|---|---|---|
| 1 | **Sitio público** | `/`, `/perfil`, `/servicios`, `/ubicacion`, `/contacto` | Presentación profesional e información del consultorio |
| 2 | **Agendado de citas** | `/agendar` | Formulario en 3 pasos con Turnstile; modificación/cancelación por token |
| 3 | **Tienda médica** | `/tienda` | Catálogo, carrito persistente (`localStorage`), checkout Stripe |
| 4 | **Autofactura CFDI 4.0** | `/autofactura` | Generación de factura electrónica post-compra (Factura.com) |
| 5 | **Expediente clínico (EHR)** | `/staff/ehr` | Historia clínica NOM-004-SSA3 con campos NOM-024 Track 1 |
| 6 | **Notas, recetas y consentimientos** | `/staff/notas` | Notas SOAP, recetas con firma SHA-256, somatometría y signos vitales |
| 7 | **Agenda staff** | `/staff/agenda` | Calendario interactivo y bloqueo de rangos de fechas |
| 8 | **Admin tienda** | `/staff/tienda` | CRUD productos, gestión de pedidos y estadísticas |
| 9 | **Dashboard** | `/staff/dashboard` | Métricas clínicas, operativas y de ventas |
| 10 | **Configuración** | `/staff/configuracion` | Datos del consultorio, logo, cédulas profesionales y bloqueos |
| 11 | **Admin** | `/staff/admin` | Gestión de usuarios, bitácora de auditoría, solicitudes ARCO |
| 12 | **Exportación DGIS** | `/staff/dgis` | Generación y descarga del archivo GIIS-B015 (SIS-CEX) |
| 13 | **Cobros** | `/staff/cobros` | Registro de honorarios por cita, resumen financiero y exportación CSV |

---

## Estructura del proyecto

```text
otorrinonet2/
├── prisma/
│   ├── schema.prisma         # Esquema de base de datos PostgreSQL
│   └── seed.ts               # Datos iniciales (usuarios, configuración, productos)
├── vitest.config.ts          # Configuración de pruebas unitarias Vitest
├── playwright.config.ts      # Configuración de pruebas E2E Playwright
├── src/
│   ├── app/
│   │   ├── (public)/         # Sitio público, agendado, tienda y autofactura
│   │   ├── staff/            # Panel interno (requiere sesión + 2FA)
│   │   ├── login/            # Autenticación (credenciales → verificación 2FA)
│   │   ├── actions/          # Server Actions seguras
│   │   └── api/              # API routes (Stripe webhook, cron, DGIS export, CSP)
│   ├── components/
│   │   ├── sitio-publico/    # PublicHeader, PublicFooter, Breadcrumbs
│   │   ├── tienda/           # Carrito, checkout, catálogo
│   │   ├── ehr/              # Expediente clínico y antecedentes
│   │   ├── notas/            # Notas de evolución, recetas, somatometría
│   │   └── shell/            # StaffShell (navegación y estructura del panel)
│   ├── __tests__/            # Suite de tests unitarios (113/113 en verde)
│   ├── e2e/                  # Suite de tests E2E Playwright (10/10 en verde)
│   └── lib/
│       ├── dal.ts            # verifySession() — control de acceso y DAL
│       ├── clinic-config.ts  # Configuración del doctor/clínica (env + BD)
│       ├── stripe.ts         # Cliente Stripe server-side
│       ├── mailer.ts         # Emails transaccionales con escape HTML esc()
│       ├── ntfy.ts           # Push notifications al staff (ntfy autoalojado)
│       └── prisma.ts         # Cliente Prisma singleton
├── docs/                     # Guías operativas y restauración
├── memory/                   # PRD y especificaciones del producto
├── AGENTS.md                 # Reglas obligatorias para agentes de IA
├── CLAUDE.md                 # Guía de contexto para asistentes
├── SECURITY.md               # Política de seguridad y SGSI NOM-024
└── RESUMEN_EJECUTIVO_OTORRINONET.md
```

---

## Requisitos previos

- **Node.js**: 20+
- **PostgreSQL**: 15+
- **npm**: 10+
- **PM2**: `npm install -g pm2`

---

## Configuración inicial (Desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Sincronizar esquema de base de datos
npx prisma db push

# 4. Cargar datos iniciales
npm run db:seed

# 5. Iniciar servidor de desarrollo (puerto 3000)
npm run dev
```

---

## Scripts npm disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (`http://localhost:3000`) |
| `npm run build` | Compilación optimizada para producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm test` | Ejecutar suite de pruebas unitarias en modo watch (Vitest) |
| `npm run test:coverage` | Pruebas con reporte de cobertura |
| `npx vitest run` | Ejecución única de la suite completa de pruebas unitarias |
| `npx prisma db push` | Sincronizar esquema Prisma con la base de datos |
| `npx prisma generate` | Regenerar el cliente Prisma Client |
| `npm run db:seed` | Cargar datos iniciales de prueba / producción |
| `npm run db:studio` | Interfaz gráfica de base de datos (Prisma Studio) |

---

## Suite de Pruebas Automatizadas

### Tests unitarios — Vitest

Framework: **Vitest** con `jsdom` y `@testing-library/react`. **113 tests en verde.**

```text
src/__tests__/
├── schemas/tienda.test.ts          # 7 casos — schemas Zod (checkout, carrito, dirección)
├── lib/mailer.test.ts              # 5 casos — función esc() escape HTML
├── lib/giis-b015.test.ts           # 28 casos — generador GIIS-B015 (normName, serializeRow, buildGiisFile)
├── lib/crypto.test.ts              # 11 casos — cifrado AES-256-GCM de datos sensibles
├── lib/turnstile.test.ts           # 8 casos — verificación de tokens Cloudflare Turnstile
├── hooks/useCarrito.test.ts        # 8 casos — hook carrito (localStorage, subtotal, envío)
├── actions/appointments.test.ts   # 16 casos — slots, fechas bloqueadas, reagendamiento
├── actions/auth.test.ts            # 18 casos — rate-limit, lockout, password reset, sessionVersion
└── api/stripe-webhook.test.ts      # 12 casos — firma HMAC, idempotencia, stock, estados de orden
```

> [!NOTE]
> En factories de `vi.mock()`, declarar las variables hoisted utilizando `vi.hoisted()`.

### Tests E2E — Playwright

**10/10 tests en verde.** Requieren el servidor levantado en el puerto 5000:

```text
src/e2e/
├── smoke.spec.ts    # 3 casos — páginas públicas básicas y renderizado
├── login.spec.ts    # 5 casos — login 2FA completo, cierre de sesión, guard /staff
└── agendar.spec.ts  # 2 casos — carga del formulario, flujo de selección de cita
```

---

## Variables de Entorno

| Variable | Descripción | Entorno |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (`postgresql://...`) | Requerido |
| `SESSION_SECRET` | Secreto para firmar cookies de sesión JWT (`openssl rand -hex 64`) | Requerido |
| `ENCRYPTION_KEY` | Clave AES-256-GCM para cifrado de datos de pacientes (32 bytes hex) | Requerido |
| `ENCRYPTION_KDF_SALT` | Salt para derivación de clave criptográfica (32 bytes hex) | Requerido |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key pública de Cloudflare Turnstile | Requerido |
| `TURNSTILE_SECRET` | Clave secreta de Cloudflare Turnstile | Requerido |
| `TURNSTILE_HOSTNAMES` | Hostnames autorizados separados por coma (`localhost,127.0.0.1,otorrinonet.com`) | Opcional |
| `SMTP_HOST` | Servidor SMTP para envío de correos | Requerido |
| `SMTP_PORT` | Puerto del servidor SMTP (ej. `587` o `465`) | Requerido |
| `SMTP_USER` | Usuario / cuenta del servidor SMTP | Requerido |
| `SMTP_PASS` | Contraseña del servidor SMTP | Requerido |
| `SMTP_FROM` | Remitente predeterminado (`"Dr. Viveros ORL <noreply@otorrinonet.com>"`) | Requerido |
| `NTFY_BASE_URL` | URL base del servidor ntfy autoalojado (`https://ntfy.otorrinonet.com`) | Opcional |
| `NTFY_STAFF_TOPIC` | Topic de ntfy para notificaciones del personal | Opcional |
| `NTFY_STAFF_TOKEN` | Token de acceso (escritura) para publicar en ntfy | Opcional |
| `NEXT_PUBLIC_APP_URL` | URL canónica pública del sitio (`https://otorrinonet.com`) | Requerido |
| `CLINIC_NAME` | Nombre del consultorio (fallback de base de datos) | Opcional |
| `CLINIC_EMAIL` | Email de contacto del consultorio | Opcional |
| `CLINIC_PHONE` | Teléfono del consultorio | Opcional |
| `CLINIC_ADDRESS` | Dirección física del consultorio | Opcional |
| `CLINIC_COFEPRIS` | Número de aviso de funcionamiento COFEPRIS | Opcional |
| `DOCTOR_NAME` | Nombre completo del médico titular | Opcional |
| `DOCTOR_LICENSE` | Cédula profesional de médico cirujano | Opcional |
| `DOCTOR_SPECIALTY_LICENSE` | Cédula de especialidad en Otorrinolaringología | Opcional |
| `DOCTOR_UNIVERSITY` | Universidad de titulación del médico | Opcional |
| `SEED_PASSWORD_MEDICO` | Contraseña inicial para el usuario médico en `seed.ts` | Opcional |
| `SEED_PASSWORD_RECEPCIONISTA` | Contraseña inicial para recepción en `seed.ts` | Opcional |
| `SEED_PASSWORD_ENFERMERA` | Contraseña inicial para enfermería en `seed.ts` | Opcional |
| `GOOGLE_PLACES_API_KEY` | API Key para consultar y cachear reseñas de Google Places | Opcional |
| `CRON_SECRET` | Token Bearer para proteger endpoints de cron (`/api/cron/reminder`, `/api/cron/nps`) | Requerido |
| `FACTURA_COM_API_KEY` | API Key para autofacturación CFDI 4.0 con Factura.com | Opcional |
| `FACTURA_COM_SECRET_KEY` | Secret Key de Factura.com | Opcional |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_live_...` / `sk_test_...`) | Requerido |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe (`pk_live_...` / `pk_test_...`) | Requerido |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe (`whsec_...`) | Requerido |
| `TIENDA_COSTO_ENVIO_CENTAVOS` | Costo de envío en centavos MXN (default: `15000` = $150 MXN) | Opcional |

---

## Despliegue en Producción (PM2)

```bash
# 1. Compilar el proyecto
npm run build

# 2. Iniciar proceso en PM2
pm2 start "npm run start -- -p 5000" --name otorrinonet
pm2 save
pm2 startup
```

**Actualización continua en VPS:**
```bash
git pull origin master
npm run build
pm2 restart otorrinonet
```

---

## Roles y Control de Acceso

Punto de entrada: `/login`. El sistema valida credenciales y 2FA TOTP antes de redirigir según el rol:

| Rol | Rutas y Permisos |
|---|---|
| `medico` | Acceso total a `/staff/*` (EHR, notas SOAP, firma digital, recetas, tienda, finanzas, configuración, DGIS) |
| `enfermera` | `/staff/ehr` (lectura), `/staff/notas` (somatometría y signos vitales), `/staff/agenda` |
| `recepcionista` | `/staff/agenda` (calendario y agendado de citas) |

---

## Cumplimiento Normativo Sanitario

| Norma | Descripción | Estado |
|---|---|---|
| **NOM-004-SSA3-2012** | Expediente clínico electrónico estructurado, notas SOAP, recetas y firma electrónica SHA-256 | ✅ Implementado |
| **LFPDPPP** | Aviso de privacidad integral, módulo de derechos ARCO y cifrado AES-256-GCM en reposo | ✅ Implementado |
| **NOM-024 Track 1** | Datos mínimos del paciente (CURP, sexo biológico/género, derechohabiencia, origen étnico) | ✅ Implementado |
| **NOM-024 Track 2** | Catálogos fundamentales oficiales (CIE-10 integrado en diagnósticos clínicos) | ✅ Implementado |
| **NOM-024 Track 3** | Interoperabilidad GIIS-B015 SIS Consulta Externa (`/api/dgis/exportar-cex`, `/staff/dgis`) | ✅ Implementado |
| **NOM-024 Track 4** | GIIS-A004 SGSI (ISO 27799 / ISO/IEC 27002, 11 dominios y DDA) | 🔄 En maduración |
| **HL7-FHIR R4** | Estructura de interoperabilidad y exportación clínica estándar | ⏳ Roadmap |

> [!IMPORTANT]
> **Certificación ante la DGIS (Secretaría de Salud):** El sistema cumple con los requisitos técnicos de evaluación de conformidad (PEC). Para consultas técnicas del proceso: `angel.serrano@salud.gob.mx` y `blanca.pinette@salud.gob.mx`.
