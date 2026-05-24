# Resumen Ejecutivo: Proyecto OtorrinoNet
**Fecha:** 24 de mayo de 2026
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
| Expediente clínico (EHR) | `/staff/ehr` | ✅ Activo |
| Notas SOAP, recetas y consentimientos | `/staff/notas` | ✅ Activo |
| Recordatorio por email (cron 24 h) | `/api/cron/reminder` | ✅ Activo |
| NPS post-consulta (Google Places) | `/api/cron/nps` | ✅ Activo |
| Tienda médica en línea | `/tienda` | ✅ Activo |
| Admin de tienda (productos, pedidos) | `/staff/tienda` | ✅ Activo |
| Dashboard clínico | `/staff/dashboard` | ✅ Activo |
| Configuración del consultorio | `/staff/configuracion` | ✅ Activo |
| Panel admin (usuarios, bitácora, ARCO) | `/staff/admin` | ✅ Activo |

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

Implementada en mayo 2026. **66/66 tests en verde** con Vitest.

| Módulo | Tests | Qué verifica |
|--------|-------|-------------|
| Schemas Zod (tienda) | 7 | Checkout, carrito, dirección, email |
| `esc()` mailer | 5 | Escape HTML de inputs en emails |
| Hook `useCarrito` | 8 | Carrito, subtotal, envío, localStorage |
| Appointments | 17 | Solapamiento de slots, fechas bloqueadas, reagendamiento |
| Auth | 18 | Rate-limit, lockout, password reset, sessionVersion |
| Webhook Stripe | 11 | Idempotencia, stock, estados de orden |

---

## 7. Interoperabilidad (HL7-FHIR R4)

- **Estado actual:** La estructura de datos del EHR es compatible con FHIR R4. El dashboard administrativo contempla la exportación.
- **Pendiente:** Endpoints de exportación individual y bulk no implementados. Requieren definir el sistema receptor (laboratorio, HIS, IMSS).

---

## 8. Pendientes y Roadmap

| Ítem | Estado | Bloqueador |
|------|--------|-----------|
| Botón WhatsApp / `tel:` en header (FIX-09) | ⏳ Bloqueado | Confirmar número celular del Dr. Viveros |
| Autofactura CFDI 4.0 (tienda Fase 3) | ⏳ Sin fecha | Definir proveedor de facturación |
| Exportación FHIR (P1-F) | ⏳ Sin fecha | Definir sistema receptor |
| Módulo de cobros interno | ⏳ Sin fecha | Decisión de scope (sin Stripe, registro manual) |
| E2E tests con Playwright (T3) | ⏳ Sin fecha | Prioridad baja para escala actual |
| Telemedicina (Daily.co) | ⏳ Sin fecha | Largo plazo |
| Portal del paciente (login propio) | ⏳ Sin fecha | Largo plazo |

---

## 9. Conclusión

OtorrinoNet cuenta con una base tecnológica sólida, moderna y en producción activa. Cumple con los pilares de seguridad, registro e integridad exigidos por las normas NOM-004, NOM-024 y LFPDPPP. La incorporación de una suite de tests automatizados cubre las áreas de mayor riesgo clínico y financiero (citas, autenticación, pagos). La prioridad para la siguiente fase es la finalización del módulo FHIR y la autofactura CFDI, ambas condicionadas a decisiones del cliente sobre proveedores externos.
