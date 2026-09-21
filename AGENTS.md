# AGENTS.md — OtorrinoNet

Reglas y lineamientos obligatorios para agentes de IA que trabajen en este repositorio.

---

## Contexto del proyecto

Sistema clínico y portal de pacientes para la consulta de otorrinolaringología del **Dr. Alejandro Viveros Domínguez** (CDMX).
Ver [`CLAUDE.md`](./CLAUDE.md) y [`README.md`](./README.md) para el stack completo, arquitectura, archivos clave y convenciones operativas.

---

## Reglas obligatorias

### Seguridad

> [!CAUTION]
> - **Nunca leer ni modificar `.env`**. Las claves de producción (Stripe, JWT, credenciales de BD) viven ahí.
> - **No exponer datos de pacientes** en logs, comentarios ni mensajes de error al cliente.

- Todo input de usuario que llegue a un email o consulta debe pasar por la función `esc()` de `src/lib/mailer.ts` o por el cliente Prisma (que ya parametriza consultas SQL).
- El webhook de Stripe (`/api/stripe/webhook`) verifica obligatoriamente la firma HMAC — **no omitir ni alterar esa verificación**.

### Base de datos y Schema Prisma

> [!IMPORTANT]
> **No usar `prisma migrate`** — este proyecto utiliza `prisma db push` exclusivamente.

- Después de cualquier cambio en `prisma/schema.prisma` ejecutar:
  ```bash
  npx prisma db push && npx prisma generate
  ```

### Archivos protegidos (no modificar sin instrucción explícita)

| Archivo | Razón |
|---|---|
| `src/app/api/stripe/webhook/route.ts` | Lógica crítica de pago — cualquier error rompe la tienda |
| `src/lib/dal.ts` | Autenticación y control de acceso — fallas aquí exponen todo el panel |
| `src/lib/session.ts` | Firma y verificación de JWT de sesión |
| `src/proxy.ts` | Middleware CSP y guards de ruta |
| `prisma/schema.prisma` | Schema de base de datos de producción |

### Git y Versionamiento

- Commits en español, en imperativo, con prefijo convencional: `feat:`, `fix:`, `chore:`, `docs:`.
- Nunca ejecutar `git push --force`.
- Nunca commitear `.env` ni archivos con credenciales o secretos.

### Infraestructura

- La configuración activa de Nginx en VPS está en `/etc/nginx/conf.d/otorrinonet.conf` (o `/etc/nginx/sites-available/otorrinonet.conf` con symlink a `sites-enabled/`).
- Después de cambiar la configuración de Nginx:
  ```bash
  nginx -t && nginx -s reload
  ```
- Después de un rebuild de producción con PM2:
  ```bash
  pm2 restart otorrinonet
  ```
- **No correr `npm install` en producción** sin autorización explícita.

---

## Flujo de trabajo seguro

1. Leer el archivo completo antes de editarlo.
2. Realizar cambios mínimos y específicos — evitar refactorizaciones de código no relacionadas con la tarea.
3. Si se modifica el esquema de Prisma: ejecutar `npx prisma db push && npx prisma generate`.
4. Si se modifica código de producción: el usuario realizará el rebuild y reinicio en PM2.
5. Verificar con `nginx -t` antes de recargar Nginx.

---

## Suite de tests

El proyecto cuenta con **113 tests unitarios en verde** ejecutados con Vitest. Ejecutar `npm test` o `npx vitest run` antes de proponer cualquier cambio.

```text
src/__tests__/
├── schemas/tienda.test.ts          # Zod schemas (7 casos)
├── lib/mailer.test.ts              # esc() escape HTML (5 casos)
├── lib/giis-b015.test.ts           # generador GIIS-B015 SIS-CEX (28 casos)
├── lib/crypto.test.ts              # cifrado AES-256-GCM de datos sensibles (11 casos)
├── lib/turnstile.test.ts           # verificación Cloudflare Turnstile (8 casos)
├── hooks/useCarrito.test.ts        # hook carrito localStorage (8 casos)
├── actions/appointments.test.ts   # slots, fechas bloqueadas, reagendamiento (16 casos)
├── actions/auth.test.ts            # rate-limit, password reset, lockout (18 casos)
└── api/stripe-webhook.test.ts      # idempotencia, stock Stripe (12 casos)
```

> [!NOTE]
> **Regla de mocking en Vitest:** Utilizar `vi.hoisted()` para variables referenciadas dentro de factories de `vi.mock()`.

Si modificas código en `src/app/actions/`, `src/lib/mailer.ts`, `src/lib/turnstile.ts`, `src/lib/crypto.ts`, `src/hooks/useCarrito.ts` o el webhook de Stripe, verificar que los tests correspondientes sigan pasando.

---

## Qué NO hacer

- No agregar `console.log` con datos sensibles (tokens, IDs de paciente, datos de tarjeta).
- No usar `'use client'` en Server Actions ni en archivos dentro de `src/app/actions/`.
- No modificar el flujo de autenticación (2FA, sesiones) sin instrucción explícita — es zona de alta sensibilidad.
- No instalar dependencias sin confirmar con el usuario.
- No correr migraciones de base de datos (`prisma migrate`) — solo `prisma db push`.
- No modificar archivos de test sin correr `npx vitest run` al final para comprobar que pasen.

---

## Certificación NOM-024-SSA3-2012 (Proyecto Activo)

El sistema se está certificando como SIRES ante la DGIS (Secretaría de Salud). 4 tracks en curso:

- **Track 1** — Datos mínimos del paciente: CURP, sexo CURP/biológico/género, derechohabiencia, entidad de nacimiento, indígena, afromexicano, migrante (campos en modelo `Patient`).
- **Track 2** — Catálogos fundamentales: CIE-10 en diagnósticos de notas, CLUES del consultorio, catálogos DGIS.
- **Track 3** — GIIS-B015 Consulta Externa: somatometría + signos vitales en nota clínica, generador de archivo de intercambio SIS-CEX en `src/app/api/dgis/exportar-cex/route.ts`, UI en `src/app/staff/dgis/`.
- **Track 4** — GIIS-A004 SGSI: documentación de 11 dominios ISO 27799, Declaración de Aplicabilidad (DDA). Requiere 6 meses de madurez documental.

> [!IMPORTANT]
> **Regla crítica GIIS-B015:** Los nombres en el archivo de intercambio deben estar en MAYÚSCULAS sin acentos (A-Z + Ñ). Máximo 15% de registros con CURP genérica (`XXXX999999XXXXXX99`). Máximo 5% de diagnósticos con código CIE-10 `R69X`.

### Archivos protegidos de interoperabilidad DGIS

| Archivo | Razón |
|---|---|
| `src/app/api/dgis/exportar-cex/route.ts` | Generador GIIS-B015 — lógica crítica de interoperabilidad SSA |
| `src/lib/catalogos/` | Catálogos CIE-10 y DGIS — verificar versión oficial antes de actualizar |
| `src/lib/schemas/dgis.ts` | Validaciones exactas de la GIIS-B015 — errores invalidan la certificación |
