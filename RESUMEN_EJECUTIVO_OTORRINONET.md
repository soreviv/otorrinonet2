# Resumen Ejecutivo: Proyecto OtorrinoNet
**Fecha:** 13 de junio de 2026
**Asunto:** Informe de Estado Técnico y Cumplimiento Normativo

---

## 1. Introducción
OtorrinoNet es una plataforma integral de gestión clínica y portal de pacientes para la práctica privada de otorrinolaringología del Dr. Alejandro Viveros Domínguez (CDMX). El sistema combina sitio público, agenda de citas inteligente, expediente clínico electrónico (EHR), tienda médica en línea y módulos de automatización, bajo cumplimiento de normativa sanitaria mexicana.

---

## 2. Análisis de Cumplimiento Normativo

### NOM-004-SSA3-2012 (Expediente Clínico)
- **Integridad y Firma:** Firma electrónica SHA-256 en notas de evolución y recetas. Una vez firmada, la nota es inmutable; solo se permiten adendas foliadas con marca de tiempo.
- **Estructura:** EHR captura antecedentes heredo-familiares, personales patológicos y no patológicos, signos vitales y notas SOAP.

### NOM-024-SSA3-2012 (Sistemas de Información de Registro Electrónico)
- **Track 1 ✅:** Datos mínimos del paciente — CURP, sexo CURP/biológico/género, derechohabiencia, entidad de nacimiento, indicadores indígena/afromexicano/migrante en el modelo `Patient`.
- **Track 2 ✅:** Catálogos fundamentales — CIE-10 integrado en diagnósticos de notas clínicas, CLUES, catálogos DGIS.
- **Track 3 ✅:** GIIS-B015 Consulta Externa — somatometría y signos vitales en nota clínica, generador de archivo de intercambio SIS-CEX (`/api/dgis/exportar-cex`), UI en `/staff/dgis`. Validado con 28 tests unitarios.
- **Track 4 🔄:** GIIS-A004 SGSI — en documentación. Requiere 6 meses de madurez antes de la verificación ante la DGIS.
- **Bitácora de Auditoría:** Registro inmutable de accesos, creaciones, modificaciones y firmas (ID usuario, IP, timestamp, recurso).
- **Confidencialidad:** Cifrado AES-256-GCM para datos sensibles en reposo (CURP, teléfono, email, dirección).
- **Autenticación:** 2FA TOTP obligatorio para todo el personal (Google Authenticator / Authy). Sesiones server-side revocables mediante `sessionVersion`.

### LFPDPPP
- Aviso de privacidad, derechos ARCO y módulo de solicitudes implementados en panel admin.

---

## 3. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 16.2.4 (App Router) |
| **UI Library** | React 19.2.4 |
| **Estilos** | Tailwind CSS v4 |
| **Lenguaje** | TypeScript 5 |
| **Base de Datos** | PostgreSQL 15+ / Prisma 7.7.0 |
| **Autenticación** | JWT (jose) + TOTP 2FA (otplib) + bcryptjs |
| **Seguridad de Datos** | Cifrado AES-256-GCM (node:crypto) |
| **Pagos** | Stripe (PaymentIntents + Webhooks) |
| **Email** | Nodemailer (citas, recordatorios, tickets) |
| **Push** | ntfy autoalojado (notificaciones al staff: nueva cita, contacto, pedido) |
| **Captcha** | Cloudflare Turnstile |
| **Tests** | Vitest + jsdom + @testing-library/react |
| **Infraestructura** | Node.js 20+ / PM2 / nginx / VPS |

---

## 4. Módulos en Producción

| Módulo | Ruta | Estado |
|--------|------|--------|
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
| Dashboard clínico | `/staff/dashboard` | ✅ Activo |
| Configuración del consultorio | `/staff/configuracion` | ✅ Activo |
| Panel admin (usuarios, bitácora, ARCO) | `/staff/admin` | ✅ Activo |
| Exportación DGIS (GIIS-B015) | `/staff/dgis` | ✅ Activo |

---

## 5. Mejoras de Seguridad Implementadas (sprint P1)

| Mejora | Detalle |
|--------|---------|
| Rate-limit en login | 5 intentos / 15 min → bloqueo 30 min; en memoria |
| Sesiones revocables | `sessionVersion` en `StaffUser`; se incrementa al cambiar contraseña |
| HTML escape en emails | Función `esc()` en `mailer.ts`; aplicada a todos los datos externos |
| Zona horaria correcta | `date-fns-tz` con `fromZonedTime` para `America/Mexico_City` |
| Detección de solapamiento real | Ventana de `appointmentDurationMin` minutos en lugar de coincidencia exacta |
| Idempotencia de webhook Stripe | Tabla `StripeWebhookEvent` con PK = `event.id`; previene doble cobro |

---

## 6. Suite de Tests Automatizados

### Tests unitarios — Vitest

Ampliada en junio 2026. **~94 tests en verde** con Vitest.

| Módulo | Tests | Qué verifica |
|--------|-------|-------------|
| Schemas Zod (tienda) | 7 | Checkout, carrito, dirección, email |
| `esc()` mailer | 5 | Escape HTML de inputs en emails |
| GIIS-B015 | 28 | normName, serializeRow, buildGiisFile, reglas DGIS |
| Hook `useCarrito` | 8 | Carrito, subtotal, envío, localStorage |
| Appointments | 17 | Solapamiento de slots, fechas bloqueadas, reagendamiento |
| Auth | 18 | Rate-limit, lockout, password reset, sessionVersion |
| Webhook Stripe | 11 | Idempotencia, stock, estados de orden |

### Tests E2E — Playwright

Completados en junio 2026. **10/10 tests en verde** contra el servidor de producción (puerto 5000).

| Suite | Tests | Qué verifica |
|-------|-------|-------------|
| smoke | 3 | Páginas públicas básicas |
| login | 5 | Login 2FA completo, guard `/staff`, cierre de sesión |
| agendar | 2 | Carga del formulario, paso 0→1 |

---

## 7. Interoperabilidad (HL7-FHIR R4)

- **Estado actual:** La estructura de datos del EHR es compatible con FHIR R4. El dashboard administrativo contempla la exportación.
- **Pendiente:** Endpoints de exportación individual y bulk no implementados. Requieren definir el sistema receptor (laboratorio, HIS, IMSS).

---

## 8. Pendientes y Roadmap

| Ítem | Estado | Bloqueador |
|------|--------|-----------|
| Botón WhatsApp / `tel:` en header (FIX-09) | ⏳ Bloqueado | Confirmar número celular del Dr. Viveros |
| NOM-024 Track 4 — SGSI (GIIS-A004) | 🔄 En documentación | 6 meses de madurez obligatorios |
| Exportación FHIR (individual y bulk) | ⏳ Sin fecha | Definir sistema receptor (laboratorio, HIS, IMSS) |
| Módulo de cobros interno | ⏳ Sin fecha | Decisión de scope (primera vez $1,100 / subsecuente $1,000 / lavado $600) |
| Telemedicina (Daily.co) | ⏳ Sin fecha | Largo plazo |
| Portal del paciente (login propio) | ⏳ Sin fecha | Largo plazo |

---

## 9. Conclusión

OtorrinoNet cuenta con una base tecnológica sólida, moderna y en producción activa. Los tres primeros tracks de la certificación NOM-024-SSA3-2012 (datos mínimos del paciente, catálogos CIE-10 y generador GIIS-B015) están implementados y validados con ~94 tests unitarios y 10 tests E2E en verde. La autofactura CFDI 4.0 está operativa. El único track pendiente es el SGSI (Track 4 / GIIS-A004), que requiere al menos 6 meses de madurez documental antes de solicitar la verificación ante la DGIS. Las siguientes prioridades de negocio son la activación del módulo de cobros manuales y la definición del sistema receptor para la exportación FHIR.
