# Dr. Alejandro Viveros Domínguez ORL — Product Overview

## Summary

Plataforma integral para la práctica privada del Dr. Alejandro Viveros Domínguez, especialista en Otorrinolaringología y Cirugía de Cabeza y Cuello. Combina sitio web de presentación, agendado de citas en línea y expediente clínico electrónico (EHR) en un solo servidor VPS, con cumplimiento de LFPDPPP, NOM-004-SSA3, NOM-024-SSA3 y HL7-FHIR.

## Planned Sections

1. **Sitio Público** — Presentación profesional del doctor: perfil, especialidades ORL, ubicación, horarios y formulario de contacto. Cinco páginas standalone en español.

2. **Agenda de Citas** — Solicitud de citas en línea para pacientes con selección de servicio, fecha y hora; panel de gestión para recepcionista con confirmación y seguimiento.

3. **Expediente Clínico (EHR)** — Historia clínica estructurada conforme a NOM-004-SSA3 con antecedentes, padecimiento actual, exploración física ORL, diagnósticos y plan de tratamiento.

4. **Notas, Recetas y Consentimientos** — Notas de evolución, prescripción digital con firma electrónica del médico y timestamp, y consentimientos informados firmados digitalmente por el paciente.

5. **Administración, Cumplimiento e Interoperabilidad** — Gestión de usuarios y roles, auditoría de acceso (LFPDPPP), y exportación de expedientes en formato HL7-FHIR.

## Product Entities

- **Patient** — Paciente con expediente clínico
- **Appointment** — Cita médica con estado y servicio
- **Service** — Tipo de consulta disponible para agendar
- **DayAvailability / TimeSlot** — Horarios disponibles por día
- **EvolutionNote** — Nota SOAP de consulta
- **SurgicalNote** — Nota preoperatoria o postoperatoria
- **Prescription** — Receta médica digital con firma y timestamp
- **ConsentForm** — Consentimiento informado con firma del paciente
- **SystemUser** — Personal con acceso al sistema (médico, enfermera, recepcionista)
- **AuditLog** — Registro inmutable de operaciones (LFPDPPP)
- **ArcoRequest** — Solicitud de derechos ARCO de pacientes
- **FhirExport** — Exportación en formato HL7-FHIR

## Design System

**Colors:**
- Primary: teal — buttons, links, CTAs, active nav states
- Secondary: sky — tags, highlights, secondary badges
- Neutral: slate — backgrounds, text, borders, cards

**Typography:**
- Heading: DM Sans — h1–h4, nav labels, UI labels
- Body: Inter — paragraphs, UI copy, form fields
- Mono: IBM Plex Mono — timestamps, IDs, CURP, CIE-10 codes, FHIR

## Shell Architecture

Two independent shells:

- **Portal Pacientes** (`variant="patient"`) — Top navigation for public pages; shows Inicio, Servicios, Agendar Cita, Legal
- **Panel Staff** (`variant="staff"`) — Collapsible sidebar for medical staff; shows Agenda, EHR, Notas, and Admin (role-filtered)

Sitio Público (section 1) renders **without** the shell — each page has its own nav bar. All staff sections (2–5) render **inside** the staff shell.

## Implementation Sequence

Build this product in milestones:

1. **Shell** — Design tokens + dual application shell (patient portal + staff panel)
2. **Sitio Público** — Five standalone public pages for patients
3. **Agenda de Citas** — Patient booking form + receptionist calendar
4. **Expediente Clínico** — NOM-004-SSA3 EHR with role-based access
5. **Notas, Recetas y Consentimientos** — Clinical documents with digital signatures
6. **Administración** — User management, audit log, FHIR export, ARCO compliance

Each milestone has a dedicated instruction document in `product-plan/instructions/incremental/`.
