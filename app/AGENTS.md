# AGENTS.md — OtorrinoNet

Reglas para agentes de IA que trabajen en este repositorio.

## Contexto del proyecto

Sistema clínico para la consulta de otorrinolaringología del Dr. Alejandro Viveros (CDMX).
Ver `CLAUDE.md` para el stack completo, archivos clave y convenciones.

## Reglas obligatorias

### Seguridad

- **Nunca leer ni modificar `.env`**. Las claves de producción (Stripe, JWT, DB) viven ahí.
- **No exponer datos de pacientes** en logs, comentarios ni mensajes de error al cliente.
- Todo input de usuario que llegue a un email o query debe pasar por la función `esc()` de `src/lib/mailer.ts` o por el cliente Prisma (que ya parametriza).
- El webhook de Stripe (`/api/stripe/webhook`) verifica la firma HMAC — no omitir esa verificación.

### Schema Prisma

- Después de cualquier cambio en `prisma/schema.prisma` ejecutar:
  ```bash
  npx prisma db push && npx prisma generate
  ```
- **No usar `prisma migrate`** — este proyecto usa `db push` exclusivamente.

### Archivos protegidos (no modificar sin instrucción explícita)

| Archivo | Razón |
|---|---|
| `src/app/api/stripe/webhook/route.ts` | Lógica crítica de pago — cualquier error rompe la tienda |
| `src/lib/dal.ts` | Autenticación — un bug aquí expone todo el panel |
| `src/lib/session.ts` | Firma y verificación de JWT |
| `src/proxy.ts` | Middleware CSP + guards de ruta |
| `prisma/schema.prisma` | Schema de BD de producción |

### Git

- Commits en español, en imperativo, con prefijo convencional: `feat:`, `fix:`, `chore:`, `docs:`.
- Nunca hacer `git push --force`.
- Nunca commitear `.env` ni archivos con credenciales.

### Infraestructura

- La config activa de nginx está en `/etc/nginx/conf.d/otorrinonet.conf`.
  El archivo `/etc/nginx/sites-available/otorrinonet` **no es leído por nginx** (`nginx.conf` no incluye `sites-enabled/`).
- Después de cambiar el config de nginx: `nginx -t && nginx -s reload`.
- Después de un rebuild de producción: `pm2 restart otorrinonet`.
- **No correr `npm install` en producción** sin autorización explícita.

## Flujo de trabajo seguro

1. Leer el archivo antes de editarlo.
2. Hacer cambios mínimos — no refactorizar código no relacionado con la tarea.
3. Si se modifica el schema: `db push && generate`.
4. Si se modifica código de producción: el usuario hará el rebuild y restart de PM2.
5. Verificar con `nginx -t` antes de recargar nginx.

## Qué NO hacer

- No agregar `console.log` con datos sensibles (tokens, IDs de paciente, datos de tarjeta).
- No usar `'use client'` en Server Actions ni en archivos dentro de `src/app/actions/`.
- No modificar el flujo de autenticación (2FA, sesiones) sin instrucción explícita — es zona de alta sensibilidad.
- No instalar dependencias sin confirmar con el usuario.
- No correr migraciones de BD — solo `prisma db push`.
