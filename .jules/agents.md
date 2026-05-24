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

- Modificar archivos de producción fuera del alcance de la tarea asignada.
- Ejecutar `prisma migrate dev` (solo `prisma db push`).
- Eliminar o reescribir lógica existente para "limpiar" — solo agregar tests.
- Agregar dependencias de producción (solo `devDependencies`).
- Hacer push a `main` directamente — siempre abrir un PR.
