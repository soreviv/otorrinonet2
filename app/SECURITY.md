# Política de Seguridad

## Versiones soportadas

| Versión | Soporte de seguridad |
| ------- | -------------------- |
| `main` (rama principal) | :white_check_mark: Activa |
| Versiones anteriores | :x: Sin soporte |

## Reportar una vulnerabilidad

**Por favor, NO abras un Issue público para reportar vulnerabilidades de seguridad.**

Al tratarse de un sistema que maneja datos clínicos de pacientes (historiales médicos, información personal y de contacto), la divulgación responsable es fundamental para proteger la privacidad de los pacientes.

### Cómo reportar

Envía un correo a **drviverosorl@gmail.com** con el asunto:

```
[SECURITY] Descripción breve de la vulnerabilidad
```

Incluye en tu reporte:

- **Descripción** del tipo de vulnerabilidad (ej. XSS, SQLi, IDOR, fuga de datos, etc.)
- **Componente afectado** — ruta, módulo, endpoint o función vulnerable
- **Pasos para reproducir** — instrucciones claras y reproducibles
- **Impacto potencial** — qué datos o funcionalidades podrían verse afectados
- **Prueba de concepto** (opcional) — capturas, logs o código mínimo que demuestre el problema
- **Sugerencia de mitigación** (opcional)

### Qué esperar

| Plazo | Acción |
| ----- | ------ |
| ≤ 48 h | Acuse de recibo del reporte |
| ≤ 7 días | Evaluación inicial e impacto estimado |
| ≤ 30 días | Corrección publicada o plan de mitigación comunicado |

### Alcance

Las siguientes áreas son de especial interés:

- Autenticación y gestión de sesiones (JWT / cookies)
- Control de acceso a expedientes clínicos y datos de pacientes
- Endpoints de la API (`/api/*`)
- Protección de datos personales (LGPD / NOM-024-SSA3-2010)
- Subida o procesamiento de archivos
- Inyección de datos (SQL, comandos, plantillas)
- Cross-Site Scripting (XSS) y Cross-Site Request Forgery (CSRF)

### Fuera de alcance

- Ataques de denegación de servicio (DoS/DDoS)
- Ingeniería social o phishing dirigido al personal
- Vulnerabilidades en dependencias de terceros ya reportadas públicamente (abre un Issue normal o un PR actualizando la dependencia)
- Problemas en entornos de desarrollo o staging no expuestos a Internet

## Buenas prácticas internas

- Las sesiones expiran en **8 horas** y se almacenan como JWT en cookie `HttpOnly`
- Sesiones server-side revocables: `sessionVersion` en `StaffUser` se incrementa al cambiar contraseña
- Rate-limit en login: 5 intentos fallidos / 15 min → bloqueo automático de 30 min
- 2FA TOTP obligatorio para todo el personal (Google Authenticator / Authy)
- Los datos clínicos se almacenan en PostgreSQL; nunca se exponen en logs
- Cifrado columnar AES-256-GCM para datos sensibles de pacientes (CURP, teléfono, email, dirección)
- El stock de productos se decrementa únicamente en el webhook `payment_intent.succeeded` de Stripe (nunca en el redirect del cliente)
- Idempotencia de webhooks: tabla `StripeWebhookEvent` con PK = `event.id` de Stripe
- HTML escape (`esc()`) aplicado a todos los interpolados de datos externos en plantillas de email
- Las migraciones de esquema se realizan con `prisma db push` en entorno controlado
- Las variables de entorno sensibles (`DATABASE_URL`, claves de Stripe, `JWT_SECRET`, etc.) nunca se versionan
- Suite de tests automatizados cubre las áreas de mayor riesgo: detección de solapamiento de slots, flujo de autenticación (rate-limit, token de reset), idempotencia y transacciones del webhook de Stripe

## Agradecimientos

Agradecemos a quienes contribuyen responsablemente a la seguridad de este sistema. Los reportes válidos podrán ser reconocidos (con su permiso) en este archivo.

---

*Este proyecto sigue los principios de [Coordinated Vulnerability Disclosure](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html) de OWASP.*
