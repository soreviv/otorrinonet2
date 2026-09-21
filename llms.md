# OtorrinoNet — Guía de Interacción para Agentes de IA

> **Versión:** 2.1 | **Última actualización:** Septiembre de 2026  
> Este archivo guía a modelos de lenguaje y agentes de IA que interactúan con el sitio web de OtorrinoNet como usuarios (pacientes, visitantes o staff). Describe cómo navegar, qué información obtener y cómo realizar acciones en el sitio.

---

## 1. Qué es este sitio

**OtorrinoNet** es la plataforma digital del **Dr. Alejandro Viveros Domínguez**, especialista en Otorrinolaringología y Cirugía de Cabeza y Cuello, con consultorio en la Ciudad de México (CDMX).

El sitio combina:

- **Sitio web público** — Perfil profesional, servicios, ubicación y contacto.
- **Agendado de citas en línea** — Reserva, modificación y cancelación de citas médicas.
- **Tienda médica en línea** — Productos relacionados con ORL, con pago seguro mediante Stripe.
- **Autofacturación CFDI 4.0** — Generación de facturas electrónicas post-compra con Factura.com.
- **Panel de staff** — Solo para personal autorizado con 2FA (médico, enfermera, recepcionista).

**URL del sitio:** `https://otorrinonet.com` (o el dominio configurado en producción).

---

## 2. Navegación pública (sin autenticación)

Estas secciones están disponibles para cualquier visitante:

### 2.1 Inicio (`/`)

- Presentación del Dr. Alejandro Viveros Domínguez.
- Especialidad: Otorrinolaringología y Cirugía de Cabeza y Cuello.
- Resumen de servicios y testimonios de pacientes.
- Llamada a la acción principal: **Agendar cita**.

### 2.2 Perfil (`/perfil`)

- Trayectoria académica y profesional del médico.
- Cédula profesional y cédula de especialidad.
- Universidad de titulación y formación quirúrgica.
- Afiliaciones y certificaciones colegiadas.

### 2.3 Servicios (`/servicios`)

Lista completa de servicios y procedimientos de ORL:

- Consulta general de otorrinolaringología.
- Endoscopia nasal y laríngea.
- Audiometría y tamiz auditivo.
- Cirugía de tabique nasal (septoplastia funcional).
- Cirugía endoscópica de senos paranasales (FESS).
- Cirugía de amígdalas y adenoides (amigdalectomía).
- Microcirugía de cuerdas vocales.
- Cirugía de cabeza y cuello.
- Rinoseptoplastia funcional y estética.
- Otoscopia, lavado de oídos y manejo de vértigo.

### 2.4 Ubicación (`/ubicacion`)

- Dirección completa del consultorio en CDMX.
- Mapa interactivo integrado (Google Maps).
- Indicaciones de acceso y transporte.
- Horarios de atención.
- Estacionamiento disponible en las inmediaciones.

### 2.5 Contacto (`/contacto`)

- Formulario de contacto general.
- Campos requeridos: nombre, email, teléfono, asunto y mensaje.
- Protección mediante Cloudflare Turnstile (captcha invisible).
- Notificación automática al personal vía correo y push (*ntfy*).

### 2.6 Páginas legales

- `/privacidad` — Aviso de privacidad integral (cumplimiento LFPDPPP).
- `/terminos` — Términos y condiciones del servicio y tienda.
- `/cookies` — Política de cookies y banner de consentimiento (Consent Mode v2).
- `/descargo` — Descargo de responsabilidad médica.

> [!NOTE]
> Las rutas bajo `/legal/*` redirigen permanentemente (código HTTP 301) a sus URLs canónicas (`/privacidad`, `/terminos`, `/cookies`, `/descargo`).

---

## 3. Agendar cita (`/agendar`) — Flujo completo

### 3.1 Requisitos previos

- No se requiere crear cuenta ni contraseña previa.
- Verificación automática de Cloudflare Turnstile.
- Proporcionar datos de contacto válidos (correo electrónico y teléfono).

### 3.2 Paso 1: Selección de fecha y hora

- Calendario interactivo con cálculo dinámico de disponibilidad en tiempo real.
- Bloqueo automático de fechas no disponibles o feriados fijados por el consultorio.
- No es posible seleccionar fechas pasadas ni horarios ocupados.

### 3.3 Paso 2: Datos del paciente

- Nombre y apellidos (paterno y materno).
- Teléfono celular de contacto.
- Correo electrónico (indispensable para recibir la confirmación y el token).
- Motivo de la consulta y notas adicionales opcionales.

### 3.4 Paso 3: Confirmación

- Revisión del resumen de la cita médica.
- Al confirmar:
  - Se genera un token único de gestión de cita.
  - Se despacha el correo de confirmación con el token al paciente.
  - Se envía notificación push al staff mediante *ntfy*.
  - El horario queda reservado inmediatamente.

### 3.5 Post-agendado y gestión por token

- Con el **token de cita**, el paciente puede desde el correo:
  - **Modificar la cita (`/cita/modificar?token=...`)**: Seleccionar una nueva fecha y hora disponible.
  - **Cancelar la cita (`/cita/cancelar?token=...`)**: Liberar el horario de manera inmediata.

### 3.6 Recordatorios automatizados

- Envío de recordatorio por correo electrónico 24 horas antes de la cita programada (`/api/cron/reminder`).
- Encuesta de satisfacción NPS post-consulta (`/api/cron/nps`).

---

## 4. Tienda médica (`/tienda`)

### 4.1 Catálogo de productos

Productos médicos para el cuidado de salud otorrinolaringológica:

- Soluciones salinas, lavados nasales y sprays.
- Gotas óticas y lubricantes nasales.
- Protectores auditivos y tapones a medida.
- Humidificadores, nebulizadores y repuestos.
- Material de curación y cuidado post-operatorio.

### 4.2 Carrito de compras

- Adición y remoción de productos con actualización reactiva.
- Persistencia del estado en `localStorage` mediante el hook `useCarrito`.
- Cálculo dinámico de subtotal y tarifa de envío estándar ($150.00 MXN).

### 4.3 Checkout y procesamiento de pagos

- Formulario de dirección de entrega.
- Pasarela segura con **Stripe Elements** (tarjetas de crédito y débito).
- Validación de firma HMAC y decremento de inventario exclusivo en webhook (`payment_intent.succeeded`).
- Despacho automático del ticket de compra por correo.

### 4.4 Autofacturación electrónica (`/autofactura`)

- Disponible post-compra con los datos del pedido.
- Entrada de datos fiscales: RFC, Razón Social, Régimen Fiscal, Código Postal y Uso de CFDI.
- Emisión inmediata de comprobante fiscal digital **CFDI 4.0** timbrado ante el SAT vía Factura.com.

---

## 5. Panel de staff (`/staff/*`) — Acceso restringido

> [!CAUTION]
> Área privada exclusiva para personal autorizado del consultorio. Requiere credenciales válidas y verificación 2FA TOTP activa.

### 5.1 Roles y matriz de permisos

| Rol | Alcance y capacidades |
|---|---|
| **`medico`** | Acceso completo a todos los módulos: EHR, notas SOAP, firma electrónica, recetas, consentimientos, tienda, agenda, cobros, finanzas, DGIS y configuración |
| **`enfermera`** | Lectura de expedientes (`/staff/ehr`), captura de notas/somatometría (`/staff/notas`) y vista de agenda |
| **`recepcionista`** | Gestión exclusiva del calendario de citas (`/staff/agenda`) |

### 5.2 Módulos del panel

- **Expediente clínico (`/staff/ehr`)** — Historia clínica completa bajo norma NOM-004-SSA3 y datos NOM-024 Track 1.
- **Notas y recetas (`/staff/notas`)** — Notas de evolución SOAP con firma SHA-256, adendas foliadas y recetas con código de verificación.
- **Agenda (`/staff/agenda`)** — Gestión de citas del día y bloqueo de rangos vacacionales/académicos.
- **Tienda (`/staff/tienda`)** — Administración de inventario, precios y seguimiento de pedidos.
- **Cobros (`/staff/cobros`)** — Registro manual de honorarios médicos y exportación de reportes.
- **Dashboard (`/staff/dashboard`)** — Métricas clínicas y análisis operativo.
- **Exportación DGIS (`/staff/dgis`)** — Generación de archivo mensual SIS-CEX bajo especificación GIIS-B015.
- **Administración (`/staff/admin`)** — Gestión de usuarios, bitácora de auditoría y ejercicio de derechos ARCO.

---

## 6. Información del consultorio

| Parámetro | Detalle |
|---|---|
| **Médico titular** | Dr. Alejandro Viveros Domínguez |
| **Especialidad** | Otorrinolaringología y Cirugía de Cabeza y Cuello |
| **Cédula profesional** | Consultar en `/perfil` |
| **Cédula de especialidad** | Consultar en `/perfil` |
| **Ubicación** | Consultorio en Ciudad de México (detalles en `/ubicacion`) |
| **Contacto** | Formulario en `/contacto` |

---

## 7. Políticas de privacidad y protección de datos

- Los datos personales y de salud están protegidos bajo la **LFPDPPP** y la **NOM-024-SSA3-2012**.
- Cifrado en reposo con algoritmo **AES-256-GCM** para información sensible (CURP, teléfonos, correos y domicilios).
- Los titulares pueden ejercer sus derechos **ARCO** (Acceso, Rectificación, Cancelación y Oposición) a través del formulario de contacto o en el consultorio.

---

## 8. Restricciones operativas importantes

> [!IMPORTANT]
> - **Atención de emergencias:** Este portal **no** proporciona atención a urgencias médicas en tiempo real. Ante una emergencia, acudir de inmediato al hospital más cercano.
> - **Medicamentos controlados:** La tienda en línea **no** comercializa medicamentos que requieran receta médica retenida o controlada; solo productos de cuidado e higiene ORL.
> - **Validez de información:** La información publicada en el sitio es de carácter orientativo e informativo y no sustituye la consulta médica presencial.

