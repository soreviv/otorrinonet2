# agents.md — OtorrinoNet

Instrucciones de contexto para Jules al trabajar en este repositorio.

---

## Proyecto

Sistema clínico para el consultorio de otorrinolaringología del **Dr. Alejandro Viveros Domínguez** (CDMX).

- **Sitio público** (`app/src/app/(public)/`) — marketing, agendado de citas, tienda de productos médicos.
- **Panel interno** (`app/src/app/staff/`) — agenda, expediente clínico (EHR), recetas, consentimientos. Requiere sesión + 2FA.

La aplicación Next.js vive en el subdirectorio `app/`. Todos los comandos npm se ejecutan desde `app/`.

---

## Stack

- **Next.js 16** App Router · **React 19** · **TypeScript 5**
- **Prisma 7** + **PostgreSQL** — se usa `prisma db push` (sin carpeta `migrations`)
- **Tailwind CSS 4**
- **Zod 4** — validación de schemas
- **JWT** en cookie `session` (8 h) — `verifySession()` en `app/src/lib/dal.ts`
- **2FA TOTP** obligatorio para todo el personal
- **Stripe** — pagos de tienda; webhook en `/api/stripe/webhook`
- **Nodemailer** — emails transaccionales

---

## Convenciones

- Idioma del código: TypeScript. Idioma de comentarios y mensajes de error: **español (México)**.
- Commits en español, imperativo, con prefijo convencional (`feat:`, `fix:`, `chore:`, `test:`).
- No usar `any` en TypeScript. No agregar comentarios obvios.
- **No ejecutar** `prisma migrate dev` — solo `prisma db push`.
- Al modificar el schema Prisma, ejecutar `npx prisma db push && npx prisma generate`.
- `verifySession()` debe llamarse al inicio de cada Server Action del panel staff.

---

## Estado de la suite de tests

### Vitest (unitarios + integración)

| Sprint | Archivo | Tests | Estado |
|--------|---------|-------|--------|
| T0 | `vitest.config.ts`, `setup.ts`, scripts `package.json` | — | ✅ completado (Jules, 2026-05-24) |
| T1-A | `src/__tests__/schemas/tienda.test.ts` | 7 | ✅ completado (Jules, 2026-05-24) |
| T1-B | `src/__tests__/lib/mailer.test.ts` | 5 | ✅ completado (Jules, 2026-05-24) |
| T1-C | `src/__tests__/hooks/useCarrito.test.ts` | 8 | ✅ completado (Jules, 2026-05-24) |
| T2-A | `src/__tests__/actions/appointments.test.ts` | 17 | ✅ completado (Claude, 2026-05-24) |
| T2-B | `src/__tests__/actions/auth.test.ts` | 18 | ✅ completado (Claude, 2026-05-24) |
| T2-C | `src/__tests__/api/stripe-webhook.test.ts` | 11 | ✅ completado (Claude, 2026-05-24) |
| T4 | `src/__tests__/lib/giis-b015.test.ts` | 28 | ✅ completado (Claude, 2026-06-13) |
| **Total Vitest** | | **~94** | **✅ en verde** |

### Playwright (E2E)

| Archivo | Tests | Estado |
|---------|-------|--------|
| `src/e2e/smoke.spec.ts` | 3 | ✅ completado (Claude, 2026-06-13) |
| `src/e2e/login.spec.ts` | 5 | ✅ completado (Claude, 2026-06-13) |
| `src/e2e/agendar.spec.ts` | 2 | ✅ completado (Claude, 2026-06-13) |
| **Total E2E** | **10/10** | **✅ en verde** |

Nota: Turnstile de producción no es bypasseable en runtime — el test de agendar cubre hasta paso 0→1.

**Regla de mocking:** usar `vi.hoisted()` para cualquier variable que se pase dentro de un factory de `vi.mock()`. De lo contrario Vitest lanzará `Cannot access '...' before initialization`.

---

## Certificación NOM-024-SSA3-2012

El sistema se está certificando como SIRES ante la DGIS. **Tracks 1, 2 y 3 completados.** El Track 4 (SGSI) lo maneja Claude Code y requiere 6 meses de madurez documental antes de la verificación.

**Reglas críticas de la GIIS-B015** (respetar en todo el código nuevo):
- Nombres de pacientes y prestadores: **MAYÚSCULAS, sin acentos**, solo A-Z + Ñ. Caracteres especiales permitidos: `-`, `,`, `.`, `/`, `'`, `¨`.
- CURP: 18 caracteres. Genérica: `XXXX999999XXXXXX99`. Máximo 15% de registros con CURP genérica.
- Diagnósticos CIE-10: máximo 5% de registros con código `R69X`.
- Todos los campos del diccionario de datos son obligatorios en el archivo de intercambio (excepto `codigoCIEDiagnostico2` y `codigoCIEDiagnostico3` que son nullable).

---

### TAREA NOM-1 — Campos de identificación del paciente

**Rama sugerida:** `feat/nom024-datos-paciente`
**Archivos a modificar:** `app/prisma/schema.prisma`, `app/src/app/staff/pacientes/` (formulario)

Agregar al modelo `Patient` en Prisma los siguientes campos:

```prisma
curp                      String?   // 18 chars, validar algoritmo RENAPO
paisNacimiento            Int?      // Catálogo PAIS DGIS (México = 142)
entidadNacimiento         String?   // 2 chars: 99=SE IGNORA, 00=NO ESPEC, 88=NO APLICA
sexoCURP                  Int?      // 1=Hombre, 2=Mujer, 3=No binario
sexoBiologico             Int?      // 1=Hombre, 2=Mujer, 3=Intersexual
genero                    Int?      // 0=No espec, 1=Masc, 2=Fem, 3=Trans, 4=Transex, 5=Travesti, 6=Intersex, 88=Otro
derechohabiencia          String?   // Multi-valor separado por &: 0=No espec, 1=Ninguna, 2=IMSS, 3=ISSSTE, 4=PEMEX, 5=SEDENA, 6=SEMAR, 8=Otra, 10=IMSS Bienestar, 11=ISSFAM, 14=OPD IMSS BIENESTAR, 99=SE IGNORA
seConsideraIndigena       Int?      // 0=No, 1=Sí, 2=No responde, 3=No sabe, -1=Desconocido
seAutodenominaAfromexicano Int?     // 0/1/2/3/-1
migrante                  Int?      // 0=No, 1=Nacional, 2=Internacional, 3=Retornado, -1=Desconocido
paisProcedencia           Int?      // Solo si migrante=2
```

Después de modificar el schema: `npx prisma db push && npx prisma generate`.

Actualizar el formulario de paciente en el panel staff con los nuevos campos (selectores con catálogos hardcodeados por ahora).

---

### TAREA NOM-2 — Catálogos CIE-10 en notas clínicas

**Rama sugerida:** `feat/nom024-cie10`
**Archivo nuevo:** `app/src/lib/catalogos/cie10.ts`
**Archivos a modificar:** formulario de nota clínica en `app/src/app/staff/notas/`

1. Crear el archivo `app/src/lib/catalogos/cie10.ts` con los códigos CIE-10 más frecuentes en otorrinolaringología (H60-H95, J00-J99, R01-R09) como array de `{ codigo: string; descripcion: string }`. La lista completa se obtiene del catálogo oficial de la DGIS — para esta tarea incluir al menos 50 códigos frecuentes de ORL.

2. Agregar a `app/prisma/schema.prisma` en el modelo de nota clínica (o en `ClinicalNote`):
```prisma
codigoCIEDiagnostico1     String?
codigoCIEDiagnostico2     String?
codigoCIEDiagnostico3     String?
```

3. Agregar en el formulario de nota un campo de autocomplete con búsqueda por código o descripción. El valor almacenado es el código CIE-10 (ej. `H65.0`).

4. Agregar validación: no permitir guardar diagnóstico `R69X` sin al menos un diagnóstico previo válido en el mismo paciente.

---

### TAREA NOM-3 — Somatometría y signos vitales en la nota clínica

**Rama sugerida:** `feat/nom024-somatometria`
**Archivos a modificar:** schema Prisma + formulario de nota clínica

Agregar al modelo de nota clínica en Prisma:

```prisma
peso                  Float?    // kg, rango 1-400; 999=desconocido
talla                 Int?      // cm, rango 30-220; 999=desconocido
circunferenciaCintura Int?      // cm, rango 20-300; 0=desconocido
sistolica             Int?      // mmHg, rango 50-300; 0=desconocido
diastolica            Int?      // mmHg, rango 20-200; 0=desconocido
frecuenciaCardiaca    Int?      // lpm, rango 40-220; 0=desconocido
frecuenciaRespiratoria Int?     // rpm, rango 10-99; 0=desconocido
temperatura           Float?    // °C, rango 30-44; 0=desconocido
saturacionOxigeno     Int?      // % SpO2, rango 1-100; 0=desconocido
glucemia              Int?      // mg/dL, rango 20-999; 0=desconocido
```

Agregar en el formulario de nota clínica una sección "Somatometría y signos vitales" con inputs numéricos y validación de rangos. Mostrar como sección colapsable para no saturar la UI.

---

## Tareas asignables a Jules

Jules debe trabajar **únicamente** en las tareas marcadas aquí. No modificar código de producción salvo que la tarea lo indique explícitamente.

---

### TAREA T0 — Configuración de Vitest

**Rama sugerida:** `feat/tests-setup`

Instalar en `app/`:

```bash
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom vitest-mock-extended
```

Crear `app/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Crear `app/src/__tests__/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

Agregar en `app/package.json` dentro de `"scripts"`:

```json
"test": "vitest",
"test:coverage": "vitest --coverage"
```

Verificar que `mailer.ts` ya suprime envío cuando `NODE_ENV === 'test'` (no modificar si ya está).

---

### TAREA T1-A — Tests de schemas Zod

**Archivo a crear:** `app/src/__tests__/schemas/tienda.test.ts`
**Archivo fuente:** `app/src/lib/schemas/tienda.ts`
**Dependencias:** Solo Zod (ya instalado). Sin mocks.

Casos a cubrir:

| Descripción | Input | Resultado esperado |
|-------------|-------|--------------------|
| Checkout válido con envío a domicilio | `shippingChoice: 'domicilio'` + dirección completa | `success: true` |
| Checkout domicilio sin dirección | `shippingChoice: 'domicilio'` sin dirección | `success: false` |
| Checkout pickup sin dirección | `shippingChoice: 'pickup'` sin dirección | `success: true` |
| Carrito ítem cantidad 0 | `{ cantidad: 0 }` | `success: false` |
| Carrito ítem cantidad 100 | `{ cantidad: 100 }` | `success: false` (máx 99) |
| Dirección con CP de 4 dígitos | `{ cp: '1234' }` | `success: false` |
| Comprador con email inválido | `{ email: 'no-es-email' }` | `success: false` |

---

### TAREA T1-B — Tests de función `esc()` en mailer

**Archivo a crear:** `app/src/__tests__/lib/mailer.test.ts`
**Archivo fuente:** `app/src/lib/mailer.ts`

La función `esc(str: string)` escapa caracteres HTML. Debe estar exportada o ser accesible para prueba. Si no está exportada, exportarla como `export function esc`.

Casos a cubrir:

| Input | Resultado esperado |
|-------|--------------------|
| `'<script>'` | `'&lt;script&gt;'` |
| `'"comillas"'` | `'&quot;comillas&quot;'` |
| `"it's"` | `"it&#39;s"` |
| `'texto normal'` | `'texto normal'` |
| `''` | `''` (sin error) |

---

### TAREA T1-C — Tests del hook `useCarrito`

**Archivo a crear:** `app/src/__tests__/hooks/useCarrito.test.ts`
**Archivo fuente:** `app/src/hooks/useCarrito.ts`

Requiere jsdom (configurado en T0) y mock de `localStorage`. Usar `@testing-library/react` para renderizar el hook con `renderHook`.

Casos a cubrir:

| Caso | Verificación |
|------|-------------|
| Agregar producto nuevo | Aparece en `items` con cantidad 1 |
| Agregar producto existente | `items` sigue con 1 entrada, cantidad incrementada |
| `actualizarCantidad` a 0 | El ítem es eliminado |
| `eliminar` por productId | El ítem desaparece de `items` |
| `vaciar` | `items` queda como array vacío |
| `subtotal` con 2 ítems | Suma correcta de `precioUnitario × cantidad` |
| `permiteEnvio` con ítem `pickup_only` | Devuelve `false` |
| JSON inválido en `localStorage` al montar | No lanza excepción, `items` queda vacío |

Usar `vi.stubGlobal('localStorage', ...)` o un mock simple de `localStorage` con `Map` interno.

---

## Archivos clave de referencia

| Archivo | Propósito |
|---------|-----------|
| `app/src/lib/dal.ts` | `verifySession()` — autenticación |
| `app/src/lib/mailer.ts` | Emails transaccionales + función `esc()` |
| `app/src/lib/schemas/tienda.ts` | Schemas Zod (tienda y checkout) |
| `app/src/hooks/useCarrito.ts` | Hook de carrito (localStorage) |
| `app/src/app/actions/appointments.ts` | Server Action de agendado |
| `app/src/app/actions/auth.ts` | Server Actions de autenticación |
| `app/src/app/api/stripe/webhook/route.ts` | Webhook Stripe |
| `app/prisma/schema.prisma` | Schema de la base de datos |

---

## Lo que Jules NO debe hacer

### Regla principal — alcance mínimo

> **Jules solo debe tocar los archivos que la tarea indique explícitamente.**
> Si la tarea no menciona un archivo, Jules **no debe modificarlo, renombrarlo, moverlo ni eliminarlo**, aunque parezca relacionado, desactualizado o mejorable.

Esta regla es absoluta. No hay excepciones por "limpieza", "consistencia" ni "refactor aprovechando el cambio".

### Otras restricciones

- No ejecutar `prisma migrate dev` — solo `prisma db push`.
- No eliminar ni reescribir lógica existente fuera del alcance de la tarea.
- No agregar dependencias de producción (solo `devDependencies` cuando la tarea lo requiera).
- No hacer push a `master` directamente — siempre abrir un PR.
- No modificar **bajo ninguna circunstancia** los archivos protegidos de Claude Code:
  - `app/src/proxy.ts`
  - `app/src/lib/stripe.ts`
  - `app/src/lib/stripe-client.ts`
  - `app/src/lib/dal.ts`
  - `app/src/lib/session.ts`
  - `app/src/app/api/stripe/webhook/route.ts`
  - `app/next.config.ts`
  - `app/package.json` / `app/package-lock.json` (salvo que la tarea lo pida explícitamente)
- En las tareas NOM-024: los datos en BD pueden tener acentos; la normalización a MAYÚSCULAS sin acentos ocurre **solo al generar el archivo de intercambio SIS-CEX**, no al guardar en BD.

## Estado de tareas

| Tarea | Estado | Fecha |
|---|---|---|
| T0 — Configuración Vitest | ✅ Completado | 2026-05-24 |
| T1-A — Tests schemas Zod | ✅ Completado | 2026-05-24 |
| T1-B — Tests `esc()` mailer | ✅ Completado | 2026-05-24 |
| T1-C — Tests `useCarrito` | ✅ Completado | 2026-05-24 |
| T2-A — Tests appointments | ✅ Completado | 2026-05-24 |
| T2-B — Tests auth | ✅ Completado | 2026-05-24 |
| T2-C — Tests webhook Stripe | ✅ Completado | 2026-05-24 |
| T3 — E2E Playwright | ✅ Completado (10/10) | 2026-06-13 |
| T4 — Tests GIIS-B015 | ✅ Completado (28 casos) | 2026-06-13 |
| NOM-1 — Campos paciente | ✅ Completado | 2026-06-13 |
| NOM-2 — CIE-10 en notas | ✅ Completado | 2026-06-13 |
| NOM-3 — Somatometría y signos vitales | ✅ Completado | 2026-06-13 |
| NOM-4 — Generador GIIS-B015 + UI DGIS | ✅ Completado | 2026-06-13 |
| NOM-5 — SGSI (Track 4 / GIIS-A004) | 🔄 En documentación | — (6 meses madurez) |
