# Política de Seguridad — OtorrinoNet

## Versiones soportadas

| Versión | Soporte de seguridad |
|---|---|
| `master` (rama principal) | ✅ Activo |
| Versiones anteriores | ❌ Sin soporte |

---

## Reportar una vulnerabilidad

> [!WARNING]
> **Por favor, NO abras un Issue público para reportar vulnerabilidades de seguridad.**

Al tratarse de un sistema que maneja datos clínicos de pacientes (expedientes médicos, información personal y de contacto), la divulgación responsable es fundamental para proteger la privacidad de los pacientes y dar cumplimiento a la **LFPDPPP** y **NOM-024-SSA3-2012**.

### Cómo reportar

Envía un correo electrónico a **`drviverosorl@gmail.com`** con el asunto:

```text
[SECURITY] Descripción breve de la vulnerabilidad
```

Incluye en tu reporte:

- **Descripción** del tipo de vulnerabilidad (ej. XSS, SQLi, IDOR, fuga de datos, omisión de autenticación).
- **Componente afectado** — ruta, módulo, endpoint o función vulnerable.
- **Pasos para reproducir** — instrucciones claras, detalladas y reproducibles.
- **Impacto potencial** — qué datos o funcionalidades podrían verse comprometidos.
- **Prueba de concepto (PoC)** — capturas, logs o código mínimo (sin exponer datos reales de pacientes).
- **Sugerencia de mitigación** (opcional).

### Tiempos de respuesta y compromisos

| Plazo | Acción |
|---|---|
| ≤ 48 h | Acuse de recibo del reporte |
| ≤ 7 días | Evaluación inicial, clasificación e impacto estimado |
| ≤ 30 días | Corrección publicada o plan de mitigación comunicado |

---

## Alcance de la política

### Áreas en alcance

- Autenticación, tokens de sesión y gestión de credenciales (JWT / cookies `HttpOnly` / 2FA TOTP).
- Control de acceso y autorización a expedientes clínicos (EHR) y notas médicas.
- Endpoints de API (`/api/*`) y Server Actions (`src/app/actions/*`).
- Protección y cifrado de datos personales y sensibles (LFPDPPP / NOM-024-SSA3).
- Flujo de pagos y procesamiento seguro en el webhook de Stripe.
- Prevención de inyecciones (SQL vía Prisma, comandos, plantillas HTML en emails).
- Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF) y Content Security Policy (CSP).

### Fuera de alcance

- Ataques de denegación de servicio (DoS / DDoS).
- Ingeniería social, phishing o ataques físicos dirigidos al personal de la clínica.
- Vulnerabilidades conocidas en dependencias de terceros sin impacto demostrable en el sistema.
- Entornos de desarrollo locales sin exposición pública.

---

## Buenas prácticas y controles implementados

| Control / Área | Implementación técnica |
|---|---|
| **Sesiones de usuario** | JWT en cookie `HttpOnly`, `SameSite=Lax`, expiración en 8 h (`src/lib/dal.ts`) |
| **Revocación de sesiones** | `sessionVersion` en `StaffUser`; se incrementa al cambiar contraseña o revocar |
| **Rate-limit en login** | 5 intentos fallidos / 15 min → bloqueo automático de 30 min |
| **Doble factor (2FA)** | TOTP obligatorio para todo el personal (`otplib` con Google Authenticator / Authy) |
| **Cifrado en reposo** | AES-256-GCM para CURP, teléfono, email y dirección (`src/lib/crypto.ts`) |
| **Escape de contenido HTML** | Función `esc()` en `src/lib/mailer.ts` aplicada a todos los datos dinámicos en emails |
| **Webhook de Stripe** | Verificación de firma HMAC + tabla de idempotencia `StripeWebhookEvent` |
| **Control de stock** | Decremento atómico únicamente ante evento `payment_intent.succeeded` verificado |
| **Gestión de base de datos** | Exclusivamente `prisma db push` (sin migraciones directas no controladas) |
| **Gestión de secretos** | Variables de entorno nunca versionadas en Git |
| **Pruebas automatizadas** | 113 tests unitarios (Vitest) cubriendo seguridad, cifrado, rate-limit y webhooks |

---

## Seguridad en el contexto NOM-024 / GIIS-A004

El sistema implementa el **Sistema de Gestión de Seguridad de la Información (SGSI)** conforme a la guía técnica **GIIS-A004** de la DGIS (Secretaría de Salud), basada en ISO 27799 / ISO/IEC 27002.

### Controles destacados implementados

- **Control de Acceso (Dominio 7):** 2FA TOTP obligatorio, sesiones revocables, roles estrictos por área (`medico`, `enfermera`, `recepcionista`).
- **Controles Criptográficos (Dominio 8.3):** JWT firmado con secreto robusto, contraseñas hasheadas con `bcryptjs`, cifrado simétrico AES-256-GCM para datos sensibles de pacientes.
- **Copias de Seguridad (Dominio 6.5):** Automatización diaria con `pg_dump` cifrado con GPG asimétrico, retención diaria/semanal/mensual y réplica remota siguiendo la regla 3-2-1.
- **Interoperabilidad GIIS-B015:** Validación estricta de formato CURP (≤ 15% genérica), diagnósticos CIE-10 (≤ 5% código R69X) y sanitización de caracteres.

---

## Agradecimientos

Agradecemos a todos los investigadores de seguridad y profesionales que contribuyen de manera responsable a la seguridad de esta plataforma.

*Este proyecto sigue los principios de [Coordinated Vulnerability Disclosure](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html) de OWASP.*

