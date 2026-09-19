# Plan: Postfix arranca pero no envía (VPS OtorrinoNet)

## Contexto

- Síntoma reportado: **Postfix arranca pero no envía**.
- Entorno: **mismo VPS que OtorrinoNet** (Ubuntu, postfix + dovecot instalados in-place).
- Origen del envío: **scripts del sistema / cron / webmail** (sender de PHP, cron, etc. — sin SASL).
- Estado actual: **no se han revisado logs todavía**. El usuario puede pegar salida en chat.
- Sesión previa: **no persistente** — partimos de cero.

Por tanto el primer objetivo es **diagnosticar** y el segundo **aplicar fix mínimo**. No reinstalar ni rehacer a menos que el diagnóstico lo justifique.

## Hipótesis a confirmar (en orden de probabilidad)

1. **Myorigin / mydestination / relay incorrecto** → mensajes para el propio dominio rebotan a maildir inexistente.
2. **`mynetworks` no incluye 127.0.0.1** → scripts locales (cron, PHP `mail()`) son rechazados con "relay access denied" (5.5.4 / 5.7.1).
3. **Auth SASL rota** entre postfix y dovecot (`smtpd_sasl_type = dovecot` con socket mal apuntado) → clientes y webapp fallan auth.
4. **Submission (587) no abierto o no autentica** → si todo va por 25 sin SASL, los receptores remotos (Gmail/Outlook) rechazan.
5. **TLS / Let's Encrypt vencidos** → handshake falla, no se entrega.
6. **DNS / puerto 25 bloqueado por el provider** (algunos VPS bloquean saliente SMTP por defecto).

## Tareas (orden estricto)

### Fase 1 — Diagnóstico (recopilar evidencia primero, no cambiar nada)

Ejecutar y pegar la salida en el chat:

```bash
# Servicios arriba
systemctl status postfix --no-pager
systemctl status dovecot --no-pager

# Config activa
postconf -n | sort

# Cola
postqueue -p
mailq | head -40

# Logs recientes
tail -n 200 /var/log/mail.log
journalctl -u postfix --since "1 hour ago" --no-pager
journalctl -u dovecot --since "1 hour ago" --no-pager

# ¿Hay buzones reales?
ls -la /var/mail/ 2>/dev/null
ls /home/*/Maildir 2>/dev/null
getent passwd | grep -E ':(/bin/|-)'

# Puertos abiertos
ss -tlnp | grep -E ':25|:465|:587|:993|:995'

# DNS propio
dig MX otorrinonet.com +short 2>/dev/null
dig TXT otorrinonet.com +short 2>/dev/null

# Test de envío local (CRÍTICO: este caso es el del usuario)
echo "test" | mail -s "diag-local" root
sleep 3
tail -n 30 /var/log/mail.log
postqueue -p
```

Confirmar también:
- ¿Qué script específico falla? (path del cron, comando PHP, etc.)
- ¿A qué dirección(s) intenta enviar?
- ¿El mail a `root` se queda en cola o rebota?

### Fase 2 — Triaje según síntoma

| Hallazgo en log | Acción |
|---|---|
| `status=bounced (mail for … loops back to myself)` | Fijar `mydestination` o `virtual_alias_domains` para el dominio propio. |
| `Recipient address rejected: Relay access denied` y cliente es 127.0.0.1 | Añadir `127.0.0.0/8` a `mynetworks` (debería estar por defecto; verificar). |
| `SASL authentication failed` / `no SASL mechanisms` | Revisar `smtpd_sasl_type = dovecot` + `smtpd_sasl_path` apuntando al socket de dovecot (`/var/spool/postfix/private/auth` típico). `ls -l` al socket, permisos `0660` grupo `postfix`. |
| `connect to mx.gmail.com[...]:25: Connection timed out` | Puerto 25 saliente bloqueado. Pedir desbloqueo al provider o usar relay SMTP externo (Mailgun/SES). |
| `TLS handshake failed` / cert expirado | `certbot certificates`; renovar con `certbot renew`. Apuntar `smtpd_tls_cert_file` al cert vigente. |
| `status=sent` pero receptor dice "lo rebotan" | Revisar DKIM: `amavisd-new` o `opendkim` corriendo; firma presente en headers. Revisar SPF/DMARC. |

### Fase 3 — Fix mínimo

Solo editar lo mínimo necesario. Archivos a tocar con probabilidad:

- `/etc/postfix/main.cf` — `mynetworks`, `mydestination`, `smtpd_sasl_path`, `smtpd_tls_cert_file`.
- `/etc/postfix/master.cf` — verificar que `submission` esté habilitado (no `inet n - n - - smtpd` comentado).
- `/etc/dovecot/conf.d/10-master.conf` — bloque `unix_listener auth-userdb` y `auth-client` con `mode=0660 group=postfix` si SASL via dovecot.

Después de cada cambio:

```bash
postfix check
systemctl reload postfix
dovecot reload
```

Reintentar el test de envío original del script que fallaba.

### Fase 4 — Validación

- `echo test | mail -s OK root@localhost` → llega a `/var/mail/root` o Maildir de root.
- `postqueue -p` → cola vacía después de 1 min.
- Enviar a Gmail externo → llega a **Inbox** (verificar con `dig TXT` que SPF esté bien).
- `journalctl -u postfix --since "5 min ago" --no-pager` → sin errores.

## Riesgos

- Cambiar `mydestination` a dominios mal delegados convierte al VPS en open relay. Validar siempre con `postfix check` y, antes de producción, un test desde fuera (ej. `swaks --from test@… --to test@gmail.com --server localhost`).
- Certbot fallará si el cert ya venció y nginx sigue apuntando al path viejo; reiniciar nginx **después** de renovar.

## Out of scope

- Migrar a Mailcow/Poste.io/Docker.
- Configurar DKIM/ARC nuevos (solo verificar si ya existe).
- Cambiar de puerto 25 a relay externo (solo si Fase 2 confirma bloqueo).

## Pregunta abierta para Fase 2

Si tras la Fase 1 la cola rebota por "**Connection timed out**" al MX de Gmail/Outlook, ¿prefieres:
(A) Pedir desbloqueo de puerto 25 al provider, o
(B) Configurar relay SMTP externo (Mailgun/SES/Resend) hoy mismo?