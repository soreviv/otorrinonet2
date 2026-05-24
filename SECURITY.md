# Política de Seguridad

## Versiones soportadas

| Versión | Soporte de seguridad |
|---|---|
| `master` (rama principal) | ✅ Activa |
| Versiones anteriores | ❌ Sin soporte |

---

## Reportar una vulnerabilidad

**Por favor, NO abras un Issue público para reportar vulnerabilidades de seguridad.**

Al tratarse de un sistema que maneja datos clínicos de pacientes (historiales médicos, información personal y de contacto), la divulgación responsable es fundamental para proteger la privacidad de los pacientes.

### Cómo reportar

Envía un correo a **drviverosorl@gmail.com** con el asunto:

```
[SECURITY] Descripción breve de la vulnerabilidad
```

Incluye en tu reporte:

- **Descripción** del tipo de vulnerabilidad (ej. XSS, SQLi, IDOR, fuga de datos)
- **Componente afectado** — ruta, módulo, endpoint o función vulnerable
- **Pasos para reproducir** — instrucciones claras y reproducibles
- **Impacto potencial** — qué datos o funcionalidades podrían verse afectados
- **Prueba de concepto** (opcional) — capturas, logs o código mínimo
- **Sugerencia de mitigación** (opcional)

### Tiempos de respuesta

| Plazo | Acción |
|---|---|
| ≤ 48 h | Acuse de recibo del reporte |
| ≤ 7 días | Evaluación inicial e impacto estimado |
| ≤ 30 días | Corrección publicada o plan de mitigación comunicado |

---

## Alcance

Las siguientes áreas son de especial interés:

- Autenticación y gestión de sesiones (JWT / cookies / 2FA TOTP)
- Control de acceso a expedientes clínicos y datos de pacientes
- Endpoints de la API (`/api/*`)
- Protección de datos personales (LFPDPPP / NOM-024-SSA3)
- Subida o procesamiento de archivos
- Inyección de datos (SQL, comandos, plantillas)
- Cross-Site Scripting (XSS) y Cross-Site Request Forgery (CSRF)
- Flujo de pagos y webhook de Stripe

## Fuera de alcance

- Ataques de denegación de servicio (DoS/DDoS)
- Ingeniería social o phishing dirigido al personal
- Vulnerabilidades en dependencias de terceros ya reportadas públicamente
- Problemas en entornos de desarrollo o staging no expuestos a Internet

---

## Buenas prácticas internas

| Área | Implementación |
|---|---|
| Sesiones | JWT en cookie `HttpOnly`; expiran en 8 h |
| Revocación de sesiones | `sessionVersion` en `StaffUser`; se incrementa al cambiar contraseña |
| Rate-limit en login | 5 intentos fallidos / 15 min → bloqueo automático 30 min |
| 2FA | TOTP obligatorio para todo el personal (Google Authenticator / Authy) |
| Cifrado en reposo | AES-256-GCM para CURP, teléfono, email y dirección de pacientes |
| Escape HTML | Función `esc()` en `mailer.ts` aplicada a todos los inputs externos en emails |
| Webhook Stripe | Verificación de firma HMAC + idempotencia con tabla `StripeWebhookEvent` |
| Stock de tienda | Se decrementa solo en `payment_intent.succeeded` (nunca en redirect de cliente) |
| Schema Prisma | Solo `prisma db push` — sin migraciones no controladas |
| Secrets | Variables de entorno sensibles nunca versionadas |
| Tests de seguridad | Suite automatizada cubre: solapamiento de slots, rate-limit, password reset, idempotencia de webhook |

---

## Agradecimientos

Agradecemos a quienes contribuyen responsablemente a la seguridad de este sistema. Los reportes válidos podrán ser reconocidos (con su permiso) en este archivo.

---

*Este proyecto sigue los principios de [Coordinated Vulnerability Disclosure](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html) de OWASP.*
