# OtorrinoNet — Plataforma de Práctica Privada ORL

Plataforma integral para la práctica privada del **Dr. Alejandro Viveros Domínguez**, especialista en Otorrinolaringología y Cirugía de Cabeza y Cuello. Combina sitio web de presentación, agendado de citas en línea y expediente clínico electrónico (EHR) en un solo servidor, con cumplimiento de **LFPDPPP**, **NOM-004-SSA3**, **NOM-024-SSA3** y **HL7-FHIR**.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Lenguaje | TypeScript 5 |
| ORM | Prisma 7 |
| Base de datos | PostgreSQL |
| Auth | JWT (jose) + TOTP 2FA (otplib) |
| Íconos | Lucide React |
| Tipografías | Inter · DM Sans · IBM Plex Mono |

---

## Funcionalidades

| # | Módulo | Ruta | Descripción |
|---|---|---|---|
| 1 | **Shell** | — | Design tokens, PatientShell y StaffShell con navegación y roles |
| 2 | **Sitio Público** | `/`, `/perfil`, `/servicios`, `/ubicacion`, `/contacto` | Cinco páginas standalone de presentación profesional |
| 3 | **Guía de Vacunación** | `/vacunacion` | Formulario interactivo basado en SSA + CDC; accesible desde la tarjeta de Vacunación en servicios |
| 4 | **Agenda de Citas** | `/agendar`, `/staff/agenda` | Formulario de 3 pasos para pacientes; calendario de gestión para recepcionista |
| 5 | **Expediente Clínico (EHR)** | `/staff/ehr` | Historia clínica NOM-004-SSA3 con control de acceso por rol |
| 6 | **Notas, Recetas y Consentimientos** | `/staff/notas` | Notas SOAP, recetas digitales con firma y timestamp, consentimientos informados |
| 7 | **Administración** | `/staff/admin` | Usuarios, bitácora de auditoría, exportación FHIR, aviso de privacidad y solicitudes ARCO |

---

## Estructura del proyecto

```
otorrinonet/
├── app/                        # Aplicación Next.js
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema de base de datos
│   │   └── seed.ts             # Datos iniciales
│   └── src/
│       ├── app/
│       │   ├── (public)/       # Sitio público (sin shell)
│       │   ├── (patient)/      # Portal paciente con PatientShell
│       │   ├── staff/          # Panel staff con StaffShell
│       │   └── login/          # Autenticación + configuración 2FA
│       ├── components/
│       │   ├── shell/          # PatientShell, StaffShell, AppShell
│       │   ├── sitio-publico/  # Componentes del sitio público
│       │   ├── agenda/         # Componentes de citas
│       │   ├── ehr/            # Componentes del expediente clínico
│       │   ├── notas/          # Notas, recetas y consentimientos
│       │   └── admin/          # Administración y cumplimiento
│       └── lib/
│           ├── agenda-types.ts / agenda-data.ts
│           ├── ehr-types.ts / ehr-data.ts
│           ├── notas-types.ts / notas-data.ts
│           └── admin-types.ts / admin-data.ts
└── product-plan/               # Especificaciones, diseño y plan de producto
```

---

## Requisitos previos

- Node.js 20+
- PostgreSQL 15+
- npm
- PM2 (producción): `npm install -g pm2`

---

## Configuración inicial (desarrollo)

**1. Instalar dependencias**

```bash
cd app
npm install
```

**2. Variables de entorno**

```bash
cp .env.example .env
```

Editar `app/.env` con los valores reales:

```env
# Cadena de conexión a PostgreSQL
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/NOMBRE_DB"

# Secreto de sesión JWT — generar con:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET="tu-secreto-de-64-chars-hex"

# Cloudflare Turnstile (protección de formularios) — obtener en: dash.cloudflare.com > Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY="tu-site-key"    # clave pública (visible en el cliente)
TURNSTILE_SECRET_KEY="tu-secret-key"            # clave privada (solo servidor, nunca exponer)
```

**3. Crear base de datos en PostgreSQL**

```sql
CREATE USER otorrinonet WITH PASSWORD 'tu_contraseña';
CREATE DATABASE otorrinonet_db OWNER otorrinonet;
```

**4. Aplicar migraciones**

```bash
npm run db:migrate
```

Esto crea todas las tablas y genera el cliente Prisma automáticamente.

**5. Sembrar datos iniciales**

```bash
npm run db:seed
```

Crea los usuarios del equipo con contraseña por defecto `Cambiar123!`:

| Email | Nombre | Rol |
|---|---|---|
| `drviverosorl@gmail.com` | Dr. Alejandro Viveros Domínguez | `medico` |
| `carmen.salinas@viverosorl.com` | Lic. Carmen Salinas Ruiz | `recepcionista` |
| `patricia.morales@viverosorl.com` | Enf. Patricia Morales Díaz | `enfermera` |

> **Importante:** Cambia las contraseñas inmediatamente después del primer inicio de sesión.

**6. Iniciar servidor de desarrollo**

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Despliegue en producción

**1. Completar los pasos 1–5 del apartado anterior**

**2. Compilar la aplicación**

```bash
npm run build
```

**3. Iniciar con PM2**

```bash
pm2 start "npm run start -- -p 5000" --name otorrinonet
pm2 save
pm2 startup   # Para que inicie automáticamente al reiniciar el servidor
```

**4. Nginx como proxy inverso** (ejemplo de configuración)

```nginx
server {
    listen 443 ssl;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate     /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**5. Actualizar en producción** (después de cambios en el código)

```bash
git pull
npm run build
pm2 restart otorrinonet
```

---

## Scripts disponibles

```bash
npm run dev           # Servidor de desarrollo (puerto 3000)
npm run build         # Compilar para producción
npm run start         # Iniciar servidor de producción
npm run lint          # ESLint
npm run db:generate   # Regenerar cliente Prisma
npm run db:migrate    # Aplicar migraciones (también regenera el cliente)
npm run db:push       # Sincronizar esquema sin crear migración
npm run db:seed       # Sembrar usuarios iniciales
npm run db:studio     # Abrir Prisma Studio (GUI de base de datos)
```

---

## Acceso al sistema

La URL de login es `/login`. Tras autenticarse, el sistema redirige según el rol:

| Rol | Rutas disponibles |
|---|---|
| `medico` | `/staff/ehr`, `/staff/notas`, `/staff/agenda`, `/staff/admin` (acceso completo) |
| `enfermera` | `/staff/ehr` (solo lectura en datos sensibles), `/staff/notas` |
| `recepcionista` | `/staff/agenda` |

El EHR y demás módulos de staff son accesibles en `/staff/*` una vez autenticado.

---

## Cumplimiento normativo

- **NOM-004-SSA3** — Expediente clínico electrónico estructurado
- **NOM-024-SSA3** — Sistemas de información de registro electrónico
- **LFPDPPP** — Aviso de privacidad y derechos ARCO
- **HL7-FHIR** — Exportación de expedientes en formato estándar

---

## Sistema de diseño

**Colores:** Primary `teal` · Secondary `sky` · Neutral `slate`

**Tipografía:**
- Headings: DM Sans
- Body: Inter
- Mono (timestamps, CURP, códigos CIE-10, FHIR): IBM Plex Mono

Tailwind CSS v4 configurado vía bloque `@theme {}` en `src/app/globals.css` (sin `tailwind.config.ts`).
