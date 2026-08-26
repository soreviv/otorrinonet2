---
name: notificaciones-ntfy
description: Push notifications al staff vía ntfy autoalojado — úsalo al tocar `src/lib/ntfy.ts` o los puntos donde se dispara (citas, contacto, pedidos pagados).
---

## Push notifications al staff (ntfy)

- Servidor ntfy autoalojado en `https://ntfy.otorrinonet.com` (config en `/etc/ntfy/server.yml`, `behind-proxy: true`, `auth-default-access: deny-all`).
- Topic `otorrinonet-staff`. Usuario `otorrinonet-app` (solo escritura, token en `NTFY_STAFF_TOKEN`) lo usa el servidor Next.js para publicar. Usuario `dr-viveros` (solo lectura) es con el que el Dr. Viveros se suscribe desde la app ntfy (Android/iOS/web).
- Helper `sendStaffPush()` en `src/lib/ntfy.ts` — nunca lanza error ni bloquea (fire-and-forget, como los emails de `mailer.ts`).
- Enganchado en 3 puntos, junto al correo existente (no lo sustituye): nueva cita (`src/app/actions/appointments.ts`), mensaje de contacto (`src/app/actions/contact.ts`), pedido pagado (`src/app/api/stripe/webhook/route.ts`).
- Variables de entorno: `NTFY_BASE_URL`, `NTFY_STAFF_TOPIC`, `NTFY_STAFF_TOKEN`.
- Gestión de usuarios/tokens ntfy: `ntfy user list`, `ntfy access <user> <topic> <permiso>`, `ntfy token add <user>` (requiere acceso root al VPS, no está en el repo).

### Topic `otorrinonet-seguridad` (hallazgos de escaneos, no confundir con `otorrinonet-staff`)

- Topic separado para alertas de `scripts/run-security-scans.sh` (rkhunter, chkrootkit, clamav) — ver skill de scripts de seguridad si existe, o directamente el script.
- Usuario `security-scans` (solo escritura), token en `/etc/otorrinonet-security-scans.env` en el VPS (fuera del repo).
- `dr-viveros` tiene lectura en este topic además del de `otorrinonet-staff` — mismo usuario, dos topics, misma app.
