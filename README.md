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

## Funcionalidades (6 milestones completados)

| # | Módulo | Ruta | Descripción |
|---|---|---|---|
| 1 | **Shell** | — | Design tokens, PatientShell y StaffShell con navegación y roles |
| 2 | **Sitio Público** | `/`, `/perfil`, `/servicios`, `/ubicacion`, `/contacto` | Cinco páginas standalone de presentación profesional |
| 3 | **Agenda de Citas** | `/agendar`, `/staff/agenda` | Formulario de 3 pasos para pacientes; calendario de gestión para recepcionista |
| 4 | **Expediente Clínico (EHR)** | `/staff/ehr` | Historia clínica NOM-004-SSA3 con control de acceso por rol |
| 5 | **Notas, Recetas y Consentimientos** | `/staff/notas` | Notas SOAP, recetas digitales con firma y timestamp, consentimientos informados |
| 6 | **Administración** | `/staff/admin` | Usuarios, bitácora de auditoría, exportación FHIR, aviso de privacidad y solicitudes ARCO |

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

---

## Configuración inicial

**1. Instalar dependencias**

```bash
cd app
npm install
```

**2. Variables de entorno**

```bash
cp .env.example .env
```

Editar `.env`:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/otorrinonet"
JWT_SECRET="clave-secreta-segura"
```

**3. Base de datos**

```bash
npm run db:migrate   # Aplica migraciones
npm run db:seed      # Carga datos iniciales
```

**4. Iniciar servidor de desarrollo**

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Scripts disponibles

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run start         # Servidor de producción
npm run lint          # ESLint
npm run db:generate   # Regenerar cliente Prisma
npm run db:migrate    # Aplicar migraciones
npm run db:push       # Sincronizar esquema sin migración
npm run db:seed       # Cargar datos iniciales
npm run db:studio     # Abrir Prisma Studio
```

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| `medico` | Acceso completo incluyendo administración |
| `enfermera` | EHR (solo lectura en datos sensibles), notas |
| `recepcionista` | Agenda de citas |

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
