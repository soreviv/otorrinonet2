# Resumen Ejecutivo: Proyecto OtorrinoNet

**Fecha:** Septiembre de 2026  
**Asunto:** Informe de Estado Técnico, Arquitectura y Cumplimiento Normativo

---

## 1. Introducción

**OtorrinoNet** es una plataforma integral de gestión clínica, expediente electrónico y portal de pacientes para la práctica privada del **Dr. Alejandro Viveros Domínguez** (CDMX). El sistema combina sitio público, agenda de citas inteligente, expediente clínico electrónico (EHR), tienda médica en línea y módulos de automatización, bajo estricto cumplimiento de la normativa sanitaria mexicana (**NOM-004-SSA3-2012**, **NOM-024-SSA3-2012**, **LFPDPPP**).

---

## 2. Análisis de Cumplimiento Normativo

### NOM-004-SSA3-2012 (Expediente Clínico)

- **Integridad y Firma:** Firma electrónica SHA-256 en notas de evolución y recetas médicas. Una vez firmada, la nota es inmutable; solo se permiten adendas foliadas con marca de tiempo y autor.
- **Estructura:** El EHR captura antecedentes heredo-familiares, personales patológicos y no patológicos, somatometría, signos vitales y notas estructuradas en formato SOAP.

### NOM-024-SSA3-2012 (Sistemas de Información de Registro Electrónico para la Salud)

- **Track 1 ✅:** Datos mínimos del paciente — CURP, sexo CURP/biológico/género, derechohabiencia, entidad y país de nacimiento, indicadores indígena/afromexicano/migrante en el modelo `Patient`.
- **Track 2 ✅:** Catálogos fundamentales — CIE-10 integrado en diagnósticos de notas clínicas, CLUES, catálogos DGIS.
- **Track 3 ✅:** GIIS-B015 Consulta Externa — somatometría y signos vitales en nota clínica, generador de archivo de intercambio SIS-CEX (`/api/dgis/exportar-cex`), UI en `/staff/dgis`. Validado con 28 tests unitarios.
- **Track 4 🔄:** GIIS-A004 SGSI — en documentación y maduración. Requiere 6 meses de madurez documental antes de la verificación formal ante la DGIS.
- **Bitácora de Auditoría:** Registro inmutable de accesos, creaciones, modificaciones y firmas (ID usuario, IP, timestamp, recurso).
- **Confidencialidad:** Cifrado AES-256-GCM para datos sensibles en reposo (CURP, teléfono, email, dirección).
- **Autenticación:** 2FA TOTP obligatorio para todo el personal (Google Authenticator / Authy). Sesiones server-side revocables mediante `sessionVersion`.

### LFPDPPP (Protección de Datos Personales)

- Aviso de privacidad integral, módulo de derechos ARCO y registro de solicitudes en el panel de administración.

---

## 3. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Estilos** | Tailwind CSS v4 |
| **Lenguaje** | TypeScript 5 |
| **Base de Datos** | PostgreSQL 15+ / Prisma 7 |
| **Autenticación** | JWT (`jose`) + TOTP 2FA (`otplib`) + `bcryptjs` |
| **Seguridad de Datos** | Cifrado AES-256-GCM (`node:crypto`) |
| **Pagos** | Stripe (PaymentIntents + Webhooks con validación HMAC) |
| **Email** | Nodemailer (citas, recordatorios 24 h, tickets de compra) |
| **Push** | ntfy autoalojado (notificaciones al staff: nueva cita, contacto, pedido) |
| **Captcha** | Cloudflare Turnstile |
| **Tests** | Vitest + jsdom + @testing-library/react + Playwright |
| **Infraestructura** | Node.js 20+ / PM2 / Nginx / VPS |

---

## 4. Módulos en Producción

| Módulo | Ruta | Estado |
|---|---|---|
| Sitio público | `/`, `/perfil`, `/servicios`, `/ubicacion`, `/contacto` | ✅ Activo |
| Agendado de citas | `/agendar` | ✅ Activo |
| Modificación de cita por paciente | `/cita/modificar` | ✅ Activo |
| Bloqueo de fechas (vacaciones, congresos) | `/staff/agenda` | ✅ Activo |
| Expediente clínico (EHR) | `/staff/ehr` | ✅ Activo (campos NOM-024 Track 1) |
| Notas SOAP, recetas y consentimientos | `/staff/notas` | ✅ Activo (somatometría y signos vitales) |
| Recordatorio por email (cron 24 h) | `/api/cron/reminder` | ✅ Activo |
| NPS post-consulta (Google Places) | `/api/cron/nps` | ✅ Activo |
| Tienda médica en línea | `/tienda` | ✅ Activo |
| Autofactura CFDI 4.0 | `/autofactura` | ✅ Activo |
| Admin de tienda (productos, pedidos) | `/staff/tienda` | ✅ Activo |
| Dashboard clínico y de ventas | `/staff/dashboard` | ✅ Activo |
| Configuración del consultorio | `/staff/configuracion` | ✅ Activo |
| Panel admin (usuarios, bitácora, ARCO) | `/staff/admin` | ✅ Activo |
| Exportación DGIS (GIIS-B015) | `/staff/dgis` | ✅ Activo |
| Cobros (registro de honorarios) | `/staff/cobros` | ✅ Activo |

---

## 5. Medidas de Seguridad Implementadas

| Medida | Detalle |
|---|---|
| **Rate-limit en login** | 5 intentos fallidos / 15 min → bloqueo 30 min (en memoria) |
| **Sesiones revocables** | `sessionVersion` en `StaffUser`; se incrementa al cambiar contraseña |
| **Escape HTML en emails** | Función `esc()` en `mailer.ts` aplicada a todos los inputs interpolados |
| **Zona horaria estricta** | `date-fns-tz` con `fromZonedTime` para `America/Mexico_City` |
| **Detección de solapamiento** | Ventana dinámica de `appointmentDurationMin` minutos en agenda |
| **Idempotencia Stripe** | Tabla `StripeWebhookEvent` con clave primaria `event.id`; evita duplicidad |

---

## 6. Suite de Tests Automatizados

### Tests unitarios — Vitest

La suite cuenta con **113 tests en verde** distribuidos en 9 suites:

| Módulo / Archivo | Tests | Qué verifica |
|---|---|---|
| `schemas/tienda.test.ts` | 7 | Schemas Zod (checkout, carrito, dirección, email) |
| `lib/mailer.test.ts` | 5 | Escape HTML de inputs de usuario en plantillas |
| `lib/giis-b015.test.ts` | 28 | `normName`, `serializeRow`, `buildGiisFile`, reglas de interoperabilidad DGIS |
| `lib/crypto.test.ts` | 11 | Cifrado y descifrado AES-256-GCM (formato `iv:authTag:cipher`) |
| `lib/turnstile.test.ts` | 8 | Verificación de tokens de Cloudflare Turnstile y hostnames permitidos |
| `hooks/useCarrito.test.ts` | 8 | Estado del carrito, persistencia en `localStorage`, subtotal y cálculo de envío |
| `actions/appointments.test.ts` | 16 | Solapamiento de slots, bloqueo de fechas, reagendamiento seguro |
| `actions/auth.test.ts` | 18 | Rate-limit, lockout, reseteo de contraseña, validación `sessionVersion` |
| `api/stripe-webhook.test.ts` | 12 | Verificación de firma HMAC, idempotencia, decremento de stock y transacciones |

### Tests E2E — Playwright

**10/10 tests en verde** contra el entorno de pruebas en producción:

| Suite | Tests | Qué verifica |
|---|---|---|
| `smoke.spec.ts` | 3 | Carga y renderizado de páginas públicas clave |
| `login.spec.ts` | 5 | Flujo de autenticación 2FA completo, guards de `/staff`, cierre de sesión |
| `agendar.spec.ts` | 2 | Carga de formulario de citas y transición interactiva entre pasos |

---

## 7. Interoperabilidad (HL7-FHIR R4)

- **Estado actual:** La estructura de datos del EHR está alineada con los recursos FHIR R4 (*Patient*, *Encounter*, *Condition*, *Observation*, *MedicationRequest*).
- **Próximos pasos:** Definición del sistema receptor (laboratorio, HIS institucional o IMSS-Bienestar) para la activación de los endpoints de exportación individual y bulk.

---

## 8. Pendientes y Roadmap

| Ítem | Estado | Bloqueador / Condición |
|---|---|---|
| Botón WhatsApp / `tel:` en header (FIX-09) | ⏳ Bloqueado | Confirmación del número celular del Dr. Viveros |
| NOM-024 Track 4 — SGSI (GIIS-A004) | 🔄 En documentación | Cumplimiento del periodo de madurez de 6 meses |
| Exportación FHIR (individual y bulk) | ⏳ Planificado | Definición formal del sistema receptor externo |
| Telemedicina (Daily.co) | ⏳ Largo plazo | Análisis de requerimientos clínicos |
| Portal del paciente (login propio) | ⏳ Largo plazo | Análisis de adopción de usuarios |

---

## 9. Conclusión

OtorrinoNet cuenta con una arquitectura tecnológica madura, robusta y en operación productiva. Los tres primeros tracks de la certificación **NOM-024-SSA3-2012** están plenamente integrados y respaldados por una suite automatizada de **113 tests unitarios** y **10 tests E2E**. La plataforma garantiza la máxima seguridad de la información clínica y personal, cumpliendo con la legislación sanitaria y de privacidad vigente en México.

