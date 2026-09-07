# OtorrinoNet — Guía de Interacción para Agentes de IA

> **Versión:** 2.0 | **Última actualización:** 2026-09-07
> Este archivo guía a modelos de lenguaje que interactúan con el sitio web de OtorrinoNet como usuarios (pacientes, visitantes o staff). Describe cómo navegar, qué información obtener y cómo realizar acciones en el sitio.

---

## 1. Qué es este sitio

**OtorrinoNet** es la plataforma digital del **Dr. Alejandro Viveros Domínguez**, especialista en Otorrinolaringología y Cirugía de Cabeza y Cuello, con consultorio en la Ciudad de México (CDMX).

El sitio combina:

- **Sitio web público** — Perfil profesional, servicios, ubicación, contacto
- **Agendado de citas en línea** — Reserva, modificación y cancelación de citas médicas
- **Tienda médica en línea** — Productos relacionados con ORL, con pago seguro
- **Autofacturación CFDI 4.0** — Generación de facturas electrónicas post-compra
- **Panel de staff** — Solo para personal autorizado (médico, enfermera, recepcionista)

**URL del sitio:** `https://otorrinonet.com` (o el dominio configurado en producción)

---

## 2. Navegación pública (sin autenticación)

Estas secciones están disponibles para cualquier visitante:

### 2.1 Inicio (`/`)

- Presentación del Dr. Viveros Domínguez
- Especialidad: Otorrinolaringología y Cirugía de Cabeza y Cuello
- Resumen de servicios
- Botón principal: **Agendar cita**

### 2.2 Perfil (`/perfil`)

- Trayectoria académica y profesional del doctor
- Cédula profesional y cédula de especialidad
- Universidad de titulación
- Afiliaciones y certificaciones

### 2.3 Servicios (`/servicios`)

- Lista completa de servicios de ORL:
- Consulta general de otorrinolaringología
- Endoscopia nasal y laríngea
- Audiometría y tamiz auditivo
- Cirugía de tabique nasal (septoplastia)
- Cirugía de senos paranasales (FESS)
- Cirugía de amígdalas y adenoides
- Cirugía de cuerdas vocales
- Cirugía de cabeza y cuello
- Rinoplastia funcional y estética
- Otoscopia, limpieza de oídos, manejo de vértigo
- Descripción de cada procedimiento
- Indicaciones y contraindicaciones generales

### 2.4 Ubicación (`/ubicacion`)

- Dirección completa del consultorio en CDMX
- Mapa interactivo (Google Maps)
- Indicaciones de cómo llegar
- Horario de atención
- Teléfono de contacto
- Estacionamiento disponible

### 2.5 Contacto (`/contacto`)

- Formulario de contacto general
- Teléfono del consultorio
- Correo electrónico
- Campos: nombre, email, teléfono, asunto, mensaje
- Protegido por Cloudflare Turnstile (captcha invisible)
- El staff recibe notificación push al enviar el formulario

### 2.6 Páginas legales

- `/privacidad` — Aviso de privacidad (LFPDPPP)
- `/terminos` — Términos y condiciones
- `/cookies` — Política de cookies
- `/descargo` — Descargo de responsabilidad médica
- Nota: Las rutas `/legal/*` redirigen 301 a estas URLs canónicas.

---

## 3. Agendar cita (`/agendar`) — Flujo completo

### 3.1 Requisitos previos

- No se requiere cuenta de usuario
- Se requiere completar el captcha Cloudflare Turnstile
- Se requiere proporcionar datos de contacto válidos

### 3.2 Paso 1: Seleccionar fecha y hora

- Calendario interactivo con disponibilidad en tiempo real
- Los slots bloqueados por el staff no aparecen
- Fechas pasadas no son seleccionables
- Se muestra disponibilidad por franjas horarias

### 3.3 Paso 2: Datos del paciente

- Nombre completo
- Teléfono de contacto
- Correo electrónico (obligatorio para confirmación)
- Motivo de consulta (opcional pero recomendado)
- Notas adicionales (opcional)

### 3.4 Paso 3: Confirmación

- Resumen de la cita (fecha, hora, datos del paciente)
- Botón de confirmación final
- Al confirmar:
- Se genera un token único de cita
- Se envía correo de confirmación al paciente
- Se envía notificación push al staff
- El slot queda reservado

### 3.5 Post-agendado

- El paciente recibe un **token de cita** por correo
- Con este token puede:
- **Modificar la cita** — cambiar fecha/hora (si hay disponibilidad)
- **Cancelar la cita** — libera el slot automáticamente
- No se requiere contraseña; el token es la credencial

### 3.6 Recordatorios

- El sistema envía recordatorios automáticos por correo electrónico
- El paciente puede solicitar recordatorio por WhatsApp (si está configurado)

---

## 4. Tienda médica (`/tienda`)

### 4.1 Catálogo

- Productos médicos relacionados con ORL:
- Soluciones salinas y sprays nasales
- Gotas óticas
- Protectores auditivos
- Humidificadores y nebulizadores
- Suplementos y vitaminas recomendados
- Material de curación y cuidado post-operatorio
- Cada producto incluye:
- Nombre, descripción, precio
- Imagen(es)
- Indicaciones de uso
- Stock disponible
- Categoría

### 4.2 Carrito de compras

- Agregar/eliminar productos
- Modificar cantidades
- Cálculo automático de subtotal
- Costo de envío: **$150.00 MXN** por defecto (configurable)
- El carrito persiste en `localStorage` del navegador

### 4.3 Checkout

- Formulario de dirección de envío
- Método de pago: **Stripe** (tarjetas de crédito/débito)
- Proceso de pago seguro (PaymentIntents)
- Confirmación de compra por correo electrónico
- Ticket de compra adjunto

### 4.4 Autofacturación (`/autofactura`)

- Disponible **después** de completar una compra
- El usuario ingresa:
- RFC
- Razón social
- Uso CFDI (catálogo oficial SAT)
- Correo para envío de factura
- Genera factura electrónica **CFDI 4.0** válida ante el SAT
- La factura se envía por correo electrónico

---

## 5. Panel de staff (`/staff/*`) — Acceso restringido

**NO accesible al público.** Requiere:

1. Credenciales de login (email + contraseña)
2. Verificación de doble factor (TOTP 2FA)
3. Rol autorizado

### 5.1 Roles y acceso

| Rol | Qué puede hacer |
| --- | --- |
| **Médico** | Acceso completo a todos los módulos |
| **Enfermera** | Ver expedientes (solo lectura), crear notas SOAP, recetas, consentimientos, ver agenda |
| **Recepcionista** | Solo agenda (calendario de citas) |

### 5.2 Módulos del panel

- **Expediente clínico (`/staff/ehr`)** — Historia clínica estructurada (NOM-004-SSA3)
- **Notas, recetas y consentimientos (`/staff/notas`)** — Notas SOAP, recetas con firma digital, somatometría
- **Agenda (`/staff/agenda`)** — Calendario completo, bloqueo de fechas
- **Tienda admin (`/staff/tienda`)** — Gestión de productos, pedidos, estadísticas
- **Dashboard (`/staff/dashboard`)** — Métricas clínicas y de ventas
- **Configuración (`/staff/configuracion`)** — Datos del consultorio, logo, cédulas
- **Administración (`/staff/admin`)** — Usuarios, bitácora, derechos ARCO, exportación
- **Exportación DGIS (`/staff/dgis`)** — Generación de archivo GIIS-B015 para Secretaría de Salud
- **Cobros (`/staff/cobros`)** — Registro de honorarios, resumen financiero

---

## 6. Información del consultorio

| Dato | Valor (ejemplo; verificar en sitio) |
| --- | --- |
| **Doctor** | Dr. Alejandro Viveros Domínguez |
| **Especialidad** | Otorrinolaringología y Cirugía de Cabeza y Cuello |
| **Cédula profesional** | [Ver en `/perfil`] |
| **Cédula de especialidad** | [Ver en `/perfil`] |
| **Universidad** | [Ver en `/perfil`] |
| **Consultorio** | [Ver en `/ubicacion`] |
| **Dirección** | CDMX, México [Ver en `/ubicacion`] |
| **Teléfono** | [Ver en `/contacto` o `/ubicacion`] |
| **Email** | [Ver en `/contacto`] |
| **Horario** | [Ver en `/ubicacion`] |
| **COFEPRIS** | [Si aplica, ver en sitio] |

---

## 7. Políticas importantes para el usuario

### 7.1 Privacidad y protección de datos

- El sitio cumple con la **LFPDPPP** (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)
- Los datos personales y clínicos se cifran con AES-256-GCM
- El paciente tiene derechos **ARCO** (Acceso, Rectificación, Cancelación, Oposición)
- Para ejercer derechos ARCO: contactar por correo o formulario de contacto

### 7.2 Cancelación y reprogramación de citas

- Las citas pueden cancelarse o reprogramarse mediante el **token de cita** enviado por correo
- Se recomienda cancelar con al menos 24 horas de anticipación
- Los slots cancelados quedan disponibles para otros pacientes automáticamente

### 7.3 Pagos y reembolsos

- Los pagos de la tienda se procesan mediante Stripe
- Política de reembolso: [consultar términos en `/terminos`]
- Las facturas se generan en formato CFDI 4.0 válido ante el SAT

### 7.4 Descargo médico

- La información del sitio es orientativa y no sustituye la consulta médica
- Para diagnósticos y tratamientos, agendar cita presencial
- Ver `/descargo` para texto completo

---

## 8. Cumplimiento normativo visible

El sitio declara cumplimiento con:

| Norma | Qué significa para el usuario |
| --- | --- |
| **NOM-004-SSA3** | Expediente clínico electrónico estructurado y seguro |
| **LFPDPPP** | Sus datos personales están protegidos por ley |
| **NOM-024 Track 1** | Datos mínimos de identificación del paciente registrados correctamente |
| **NOM-024 Track 2** | Diagnósticos usando catálogos oficiales (CIE-10) |
| **NOM-024 Track 3** | Capacidad de exportar información a la Secretaría de Salud (DGIS) |
| **CFDI 4.0** | Facturación electrónica válida ante el SAT |

---

## 9. Cómo contactar al consultorio

### Formulario web

- Ir a `/contacto`
- Completar: nombre, email, teléfono, asunto, mensaje
- Resolver captcha Cloudflare Turnstile
- Enviar

### Por teléfono

- Número disponible en `/contacto` y `/ubicacion`
- Horario de atención telefónica: [ver en `/ubicacion`]

### Por correo electrónico

- Email disponible en `/contacto`

### Urgencias

- Este sitio **no** atiende emergencias médicas
- En caso de urgencia, acudir al servicio de urgencias más cercano o llamar a emergencias

---

## 10. Restricciones y limitaciones

- **No hay chat en vivo** en el sitio público
- **No se pueden agendar citas para terceros** sin su consentimiento explícito
- **No se venden medicamentos controlados** en la tienda (solo productos de cuidado ORL)
- **El panel de staff no está disponible** para pacientes o visitantes
- **Las facturas solo se generan** para compras completadas en la tienda
- **No hay app móvil nativa**; el sitio es responsive y funciona en navegadores móviles

---

## 11. Glosario de términos médicos/ORL

| Término | Significado |
| --- | --- |
| **ORL** | Otorrinolaringología (especialidad médica) |
| **EHR** | Expediente Clínico Electrónico (Electronic Health Record) |
| **SOAP** | Formato de nota clínica: Subjetivo, Objetivo, Análisis, Plan |
| **FESS** | Cirugía endoscópica de senos paranasales |
| **CFDI** | Comprobante Fiscal Digital por Internet (factura electrónica mexicana) |
| **DGIS** | Dirección General de Información en Salud (Secretaría de Salud) |
| **GIIS-B015** | Formato estándar para registro de consulta externa ante DGIS |
| **ARCO** | Derechos del paciente: Acceso, Rectificación, Cancelación, Oposición |
| **NOM-004-SSA3** | Norma mexicana de expediente clínico |
| **LFPDPPP** | Ley Federal de Protección de Datos Personales |

---

*Este archivo está diseñado para que un modelo de lenguaje que navega OtorrinoNet como usuario pueda orientar correctamente a pacientes y visitantes. 
Si hay discrepancia entre este archivo y el sitio en vivo, prevalece el sitio en vivo.*
