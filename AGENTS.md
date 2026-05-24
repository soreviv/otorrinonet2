# AGENTS.md

Guía para agentes de IA que trabajen en este repositorio.

## Proyecto

Sistema clínico para el consultorio del **Dr. Alejandro Viveros Domínguez**, otorrinolaringólogo en CDMX.

- **Sitio público** (`app/src/app/(public)/`) — marketing, agendado de citas, consentimientos, tienda en línea, autofacturación CFDI 4.0.
- **Panel interno staff** (`app/src/app/staff/`) — agenda, expediente clínico (EHR), notas, recetas, cobros, tienda admin. Requiere sesión autenticada.

La aplicación vive en `app/`. Todo el trabajo de código va dentro de esa carpeta.

---

## Stack

- **Next.js 16** App Router · **React 19** · **TypeScript 5**
- **Prisma 7** + **PostgreSQL** — usar `prisma db push` (sin `migrate`)
- **Tailwind CSS 4**
- **Stripe** — pagos de la tienda en línea
- **JWT** en cookie `session` (8 h) — `verifySession()` en `app/src/lib/dal.ts`
- **Nodemailer** — emails transaccionales
- **Cloudflare Turnstile** — protección del formulario de agendado
- **Zod** — validación de inputs en server actions
- **Recharts** — gráficas en el dashboard

---

## Convenciones críticas

### Autenticación
- Todas las server actions del panel staff deben llamar `await verifySession()` como primera línea.
- `verifySession()` redirige automáticamente a `/login` si no hay sesión válida.
- Las rutas `/staff/*` están protegidas por el middleware en `app/src/proxy.ts`.

### Server Actions
- Siempre `'use server'` en la primera línea del archivo.
- Retornar `{ ok: boolean; error?: string }` para mutaciones, o los datos directamente para queries.
- Usar Zod con `safeParse` para validar inputs externos. En Zod v4 usar `.issues[0].message` (no `.errors`).
- Capturar error Prisma `P2002` (unique constraint) y retornar mensaje legible.

### Schema Prisma
- Después de modificar `prisma/schema.prisma` ejecutar:
  ```bash
  npx prisma db push
  npx prisma generate
  ```
- El cliente Prisma se genera en `app/src/generated/prisma`.
- Importar tipos desde `@/generated/prisma` (enums, modelos).
- Importar el cliente desde `@/lib/prisma`.
- Montos siempre en **centavos enteros MXN** (ej. $1,100 = `110000`).

### Estilo visual — Sitio público
Todas las páginas públicas siguen este patrón:
```tsx
<div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">
  <PublicHeader />
  <Breadcrumbs items={[{ label: 'Página', href: '/ruta' }]} />
  {/* Barra blanca con título */}
  <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2">Eyebrow</p>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">Título</h1>
    </div>
  </div>
  {/* Contenido */}
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
    {/* ... */}
  </div>
  <PublicFooter />
</div>
```

### Estilo visual — Panel staff
- Heredar el `StaffShell` del layout padre — no reimplementar navegación.
- Colores: slate para fondos/texto, sky para acciones primarias.
- Cards: `bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl`.
- Referencia: `app/src/app/staff/agenda/page.tsx`.

### Componentes
- `'use client'` solo cuando el componente usa hooks, estado o eventos del browser.
- Siempre incluir variantes `dark:` en clases de Tailwind.
- No agregar comentarios salvo que el WHY sea no obvio.

### Commits y ramas

> **OBLIGATORIO antes de crear cualquier rama o PR:**
> ```bash
> git fetch origin
> git rebase origin/master
> ```
> Saltarse este paso ha causado regresiones graves en producción (archivos borrados, paquetes eliminados).

- Mensajes en **español**, en imperativo, con prefijo: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Abrir PR hacia `master` — nunca push directo a `master`.
- Si el PR toca `package.json`, incluir también `package-lock.json` actualizado.

### Rutas legales
- Las rutas canónicas son `/privacidad`, `/terminos`, `/cookies`, `/descargo`.
- No crear ni referenciar `/legal/*` (son redirects 301).

---

## Archivos clave

| Archivo | Propósito |
|---|---|
| `app/src/lib/dal.ts` | `verifySession()` — autenticación |
| `app/src/lib/clinic-config.ts` | Datos del doctor/clínica (desde env vars) |
| `app/src/lib/mailer.ts` | Emails transaccionales (Nodemailer) |
| `app/src/lib/stripe.ts` | Singleton Stripe server-side (`'server-only'`) |
| `app/src/lib/stripe-client.ts` | `stripePromise` para Stripe Elements |
| `app/src/lib/schemas/tienda.ts` | Schemas Zod de la tienda (admin + checkout) |
| `app/src/hooks/useCarrito.ts` | Hook de carrito en localStorage |
| `app/src/proxy.ts` | Middleware: auth guard + CSP con nonce |
| `app/prisma/schema.prisma` | Schema de BD |
| `app/src/generated/prisma` | Cliente Prisma generado (no editar manualmente) |
| `app/src/components/sitio-publico/PublicHeader.tsx` | Header compartido del sitio público |
| `app/src/components/sitio-publico/PublicFooter.tsx` | Footer compartido del sitio público |
| `app/src/components/sitio-publico/Breadcrumbs.tsx` | Breadcrumbs con JSON-LD |
| `app/src/components/shell/StaffShell.tsx` | Shell del panel interno (nav lateral) |

---

## División de trabajo entre agentes

Este repositorio usa **dos agentes en paralelo**:

### Jules (este agente)
- Tareas bien delimitadas, sin dependencias de Stripe ni de seguridad crítica.
- Páginas públicas de la tienda, CRUD de productos/pedidos, emails, métricas de dashboard.
- Siempre trabaja en una rama nueva y abre PR — nunca push directo a `master`.

### Claude Code (agente interactivo en el servidor)
- Integración de Stripe (Payment Intent, Stripe Elements, webhook).
- Cambios al CSP en `proxy.ts`.
- Decisiones de arquitectura y seguridad.
- Fixes de compilación post-merge.

### Regla de coordinación — ARCHIVOS PROTEGIDOS

Los siguientes archivos son propiedad exclusiva de Claude Code. **Jules no debe modificarlos, eliminarlos ni revertirlos bajo ninguna circunstancia:**

| Archivo | Por qué está protegido |
|---|---|
| `app/src/proxy.ts` | CSP con nonce + dominios de Stripe; un cambio incorrecto rompe la seguridad de toda la app |
| `app/src/lib/stripe.ts` | Singleton Stripe server-side con lazy init; si se borra el checkout deja de funcionar |
| `app/src/lib/stripe-client.ts` | `stripePromise` para Stripe Elements; si se borra el formulario de pago falla en cliente |
| `app/next.config.ts` | Configuración de caché, imágenes y redirects; no agregar ni quitar sin coordinar |
| `app/package.json` | Los paquetes `stripe`, `@stripe/stripe-js` y `@stripe/react-stripe-js` deben permanecer |
| `app/package-lock.json` | Debe mantenerse en sync con `package.json` |

**Cómo detectar si tu rama está desactualizada:**
```bash
git fetch origin
git log --oneline origin/master ^HEAD   # si lista commits → tu rama está atrasada
git rebase origin/master                # sincronizar ANTES de abrir el PR
```

Si al hacer rebase aparece un conflicto en alguno de los archivos protegidos, **resolver siempre a favor de la versión de `origin/master`** (es decir, `git checkout origin/master -- <archivo>` y luego `git add`).

Antes de hacer merge de un PR de Jules, Claude Code verifica TypeScript y aplica `prisma db push` / `prisma generate` si el schema cambió.

---

## Módulos en desarrollo activo

### Tienda en línea (Fase 1 — ✅ completada)
- **Admin staff**: ✅ completado (`/staff/tienda/`)
- **Infraestructura Stripe**: ✅ completado (`stripe.ts`, `stripe-client.ts`, CSP, `useCarrito`, schemas Zod)
- **Páginas públicas**: ✅ catálogo, detalle, carrito, checkout con Stripe Elements, confirmación, cancelado
- **Webhook**: ✅ `/api/stripe/webhook` — firma HMAC, idempotencia, transacción stock + estado, email ticket
- **Pendiente operativo**: llenar `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` en `.env` del servidor

### Autofacturación CFDI 4.0
- ✅ Completado (`/autofactura/`)
- Integrada con factura.com via `app/src/lib/factura-com.ts`

---

## Suite de tests

El proyecto tiene **66 tests en verde** con Vitest (2026-05-24). Correr `npm test` (desde `app/`) antes de abrir cualquier PR.

| Archivo | Cobertura |
|---------|-----------|
| `src/__tests__/schemas/tienda.test.ts` | Zod schemas — 7 casos |
| `src/__tests__/lib/mailer.test.ts` | `esc()` HTML escape — 5 casos |
| `src/__tests__/hooks/useCarrito.test.ts` | Hook carrito localStorage — 8 casos |
| `src/__tests__/actions/appointments.test.ts` | Slots, bloqueos, reagendamiento — 17 casos |
| `src/__tests__/actions/auth.test.ts` | Rate-limit, lockout, password reset — 18 casos |
| `src/__tests__/api/stripe-webhook.test.ts` | Idempotencia, stock, estados Stripe — 11 casos |

**Regla:** usar `vi.hoisted()` para variables en factories de `vi.mock()`.

---

## Pendientes conocidos

- **FIX-09**: botón flotante de WhatsApp y enlace `tel:` en el header — bloqueado hasta confirmar número celular del Dr. Viveros.
- **`listo_para_recoger`** falta en el enum `OrderStatus` — agregar con `prisma db push` cuando sea necesario.
- **Tienda Fase 3**: autofactura CFDI para paquetes de consulta (D01) — requiere definir proveedor de facturación.
