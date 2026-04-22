# Dr. Alejandro Viveros ORL — Complete Implementation Instructions

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Testing

Each section includes a `tests.md` file with UI behavior test specs. These are **framework-agnostic** — adapt them to your testing setup.

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

---

# Product Overview

Plataforma integral para la práctica privada del Dr. Alejandro Viveros Domínguez, especialista en Otorrinolaringología y Cirugía de Cabeza y Cuello. Combina sitio web de presentación, agendado de citas en línea y expediente clínico electrónico (EHR) en un solo servidor VPS, con cumplimiento de LFPDPPP, NOM-004-SSA3, NOM-024-SSA3 y HL7-FHIR.

**Sections:**
1. Sitio Público — Five standalone public pages for patients
2. Agenda de Citas — Patient booking form + receptionist calendar
3. Expediente Clínico — NOM-004-SSA3 EHR with role-based access
4. Notas, Recetas y Consentimientos — Clinical documents with digital signatures
5. Administración — User management, audit log, FHIR export, ARCO compliance

**Design System:** teal (primary), sky (secondary), slate (neutral) · DM Sans (headings) · Inter (body) · IBM Plex Mono (codes)

**Shell:** Two shells — `variant="patient"` (top nav for public pages) and `variant="staff"` (collapsible sidebar for staff). Sitio Público renders standalone (no shell). All staff sections render inside the staff shell.

---

# Milestone 1: Shell

## Goal

Set up the design tokens and application shell — the persistent chrome that wraps all staff sections.

## What to Implement

### 1. Design Tokens

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Color palette:** teal (primary), sky (secondary), slate (neutral)
**Typography:** DM Sans (headings/nav labels), Inter (body/UI copy), IBM Plex Mono (codes/timestamps)

### 2. Application Shell

Copy from `product-plan/shell/components/`:

- `AppShell.tsx` — Accepts `variant="patient"` or `variant="staff"`
- `PatientShell.tsx` — Top navigation for the public portal
- `StaffShell.tsx` — Collapsible sidebar for medical staff

**Patient navigation:** Inicio (`/`), Servicios (`/servicios`), Agendar Cita (`/agendar`), Legal (`/legal`)

**Staff navigation:** Agenda de Citas (`/staff/agenda`), Expediente Clínico (`/staff/ehr`), Notas y Recetas (`/staff/notas`), Administración (`/staff/admin`, médico only)

**Callbacks:** `onNavigate(href)`, `onLogout()`

## Done When

- [ ] Design tokens configured (colors, typography, Tailwind, Google Fonts)
- [ ] Patient shell renders with top navigation
- [ ] Staff shell renders with collapsible sidebar and role badge
- [ ] Active page indicated in both shells
- [ ] Staff sidebar collapses to icon-only mode (w-56 → w-16)
- [ ] Responsive on mobile · Light and dark mode work

---

# Milestone 2: Sitio Público

## Goal

Five standalone public pages (no shell) — the patient-facing website.

## Overview

Each page has its own nav bar and a "Agendar Cita" CTA. Content is static. Five pages: Home (`/`), Perfil (`/perfil`), Servicios (`/servicios`), Ubicación (`/ubicacion`), Contacto (`/contacto`).

**Key Functionality:**
- Hero with doctor photo, name, and tagline
- Doctor profile with full bio, education, certifications, hospitals
- Services grid with descriptions and booking CTA
- Location with Google Maps embed, address, and schedule
- Contact form (name + phone/email + message; validated)

## Components Provided

Copy from `product-plan/sections/sitio-publico/components/`: `HomePage`, `DoctorProfilePage`, `ServicesPage`, `LocationPage`, `ContactPage`, `ServiceCard`, `ReviewCard`, `index.ts`

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onBookAppointment()` | Any "Agendar Cita" button |
| `onViewAllServices()` | "Ver todos los servicios" on home |
| `onSubmitContactForm(data)` | Valid contact form submit |

## Expected User Flows

1. Visitor arrives at `/` → sees hero → clicks "Ver perfil completo" → navigates to `/perfil`
2. Visitor navigates to `/servicios` → clicks "Agendar consulta" → `onBookAppointment` called
3. Visitor navigates to `/contacto` → fills form → clicks "Enviar mensaje" → success state shown

## Testing

See `product-plan/sections/sitio-publico/tests.md`

## Done When

- [ ] All 5 pages render at their routes with real data
- [ ] Nav links work between pages
- [ ] Contact form validates and calls `onSubmitContactForm`
- [ ] Google Maps embed loads on Ubicación page
- [ ] WhatsApp link uses digits-only phone format
- [ ] Responsive · Dark mode works

---

# Milestone 3: Agenda de Citas

## Goal

Patient booking form + receptionist calendar.

## Overview

Two views: `AppointmentBooking` (3-step patient flow) and `AppointmentCalendar` (receptionist weekly view). Available slots are computed server-side based on the doctor's schedule (Mon/Tue/Wed 16:00–19:00, Thu/Fri 10:00–13:00, 30-min slots) and passed as `DayAvailability[]`.

**Key Functionality:**
- 3-step booking: service → date/slot → patient data
- Privacy checkbox required before submit
- Weekly calendar with status badges and side panel
- Confirm, reject, cancel, reschedule actions
- Manual appointment creation and patient search

## Components Provided

Copy from `product-plan/sections/agenda-de-citas/components/`: `AppointmentBooking`, `AppointmentCalendar`, `index.ts`

## Callback Props

`onSubmit(data)` · `onConfirm(id)` · `onReject(id)` · `onCancel(id)` · `onReschedule(id)` · `onSelect(id)` · `onCreate()` · `onSearch(query)`

## Expected User Flows

1. Patient selects service → available date/time → fills data → checks privacy → submits
2. Receptionist views pending appointment → confirms → status updates to "confirmada"
3. Receptionist clicks "Nueva Cita" → `onCreate` called → create form opens

## Testing

See `product-plan/sections/agenda-de-citas/tests.md`

## Done When

- [ ] Booking form at `/agendar` (3 steps; privacy required)
- [ ] Calendar at `/staff/agenda` inside staff shell
- [ ] Status badges: Pendiente (yellow), Confirmada (green), Cancelada (red), Reprogramada (blue)
- [ ] All action callbacks wired to working functionality
- [ ] Available/unavailable slots visually distinguished
- [ ] Responsive · Dark mode works

---

# Milestone 4: Expediente Clínico

## Goal

NOM-004-SSA3 electronic health record with role-based access.

## Overview

Searchable patient list, full expediente detail (collapsible sections), and create/edit form. Nurses can view but cannot edit diagnoses or treatment plans.

**Key Functionality:**
- Searchable list by name or expediente number
- Full expediente: datos generales, antecedentes, padecimiento actual, exploración física ORL, diagnósticos
- Create new patient record
- Edit existing record
- Role restriction: enfermera cannot edit diagnoses/plan

## Components Provided

Copy from `product-plan/sections/expediente-clinico/components/`: `PatientList`, `PatientDetail`, `PatientForm`, `index.ts`

## Callback Props

`onView(id)` · `onEdit(id)` · `onNew()` · `onSearch(query)` · `onSave(patient)` · `onCancel()`

## Expected User Flows

1. Doctor searches patient → clicks row → `onView(id)` → full expediente opens
2. Doctor clicks "Nuevo Paciente" → fills form → saves → `onSave(patient)` called
3. Nurse opens expediente → vital signs editable → diagnoses locked (read-only)

## Testing

See `product-plan/sections/expediente-clinico/tests.md`

## Done When

- [ ] Patient list at `/staff/ehr` with search
- [ ] Expediente detail with all NOM-004 sections; CURP and CIE-10 in monospace
- [ ] Role restriction enforced for enfermera
- [ ] `expedienteNumber` auto-assigned and visible in header
- [ ] DiagnosisStatus: activo (green), crónico (amber), resuelto (gray)
- [ ] Responsive · Dark mode works

---

# Milestone 5: Notas, Recetas y Consentimientos

## Goal

Clinical documents with canvas-based digital signatures and immutable timestamps.

## Overview

Grouped document list for each patient. Prescriptions use a canvas signature and become immutable once signed. Consent forms support on-screen signing (presencial) or email link. All signed documents include a legal timestamp (date + time + timezone).

**Key Functionality:**
- Document list grouped by type
- Evolution notes and surgical notes (preoperatoria/postoperatoria)
- Prescription with canvas signature → immutable once signed
- Consent form with two signing paths: on-screen canvas or email link
- Print/download for signed documents only

## Components Provided

Copy from `product-plan/sections/notas-recetas-consentimientos/components/`: `DocumentList`, `PrescriptionDetail`, `ConsentFormDetail`, `index.ts`

## Callback Props

`onNewNote()` · `onSignPrescription(id, signatureData)` · `onNewPrescription()` · `onNewConsent()` · `onSignConsent(id, signatureData)` · `onSendConsentEmail(id)` · `onPrint(id)`

## Expected User Flows

1. Doctor opens draft prescription → draws signature → "Firmar" → `onSignPrescription` called → locked with timestamp
2. Patient signs consent on tablet → canvas → "Firmar consentimiento" → `onSignConsent` called → status: firmado-presencial
3. Doctor clicks "Enviar por correo" → `onSendConsentEmail` called → patient receives signing link

## Important Notes

- Signed prescriptions and consents are legally immutable — enforce server-side
- `signatureTimestamp` must include timezone: `"2025-06-15T10:30:00 CDT (UTC-5)"`
- `signatureData` is base64 PNG from canvas

## Testing

See `product-plan/sections/notas-recetas-consentimientos/tests.md`

## Done When

- [ ] Document list at `/staff/notas` grouped by type with status badges
- [ ] Draft prescription shows canvas; signed shows lock + timestamp
- [ ] Signing prescription calls `onSignPrescription` with base64 data
- [ ] Consent on-screen signing calls `onSignConsent`
- [ ] Email consent calls `onSendConsentEmail`
- [ ] Print only available on signed documents
- [ ] Signed documents have no edit controls
- [ ] Responsive · Dark mode works

---

# Milestone 6: Administración, Cumplimiento e Interoperabilidad

## Goal

Admin panel with user management, audit log, FHIR export, and ARCO compliance. Doctor role only.

## Overview

Tab-based admin panel at `/staff/admin`. Dashboard with security metrics, user management, immutable audit log with filters, FHIR export (individual and bulk), privacy policy, and ARCO rights requests.

**Key Functionality:**
- Dashboard: active users, recent accesses, FHIR exports, pending ARCO requests, compliance badges
- User table: view, edit role, toggle active/inactive
- Audit log: immutable (no edit/delete); filterable by user, action, date
- FHIR export: individual patient or bulk with date range
- Privacy policy: view and download
- ARCO requests: list with status update

## Components Provided

Copy from `product-plan/sections/administracion-cumplimiento-interoperabilidad/components/`: `AdminDashboard`, `index.ts`

## Callback Props

`onEditUser(id)` · `onToggleUserStatus(id)` · `onExportFhir(patientId)` · `onExportFhirBulk(filters)` · `onUpdateArcoStatus(id, status)` · `onDownloadPrivacyPolicy()`

## Expected User Flows

1. Admin opens `/staff/admin` → sees dashboard metrics → clicks "Usuarios" tab → manages users
2. Admin opens "Bitácora" → filters log → sees immutable entries (no edit/delete buttons)
3. Admin opens "Exportación FHIR" → selects patient → `onExportFhir(id)` → status: en-proceso → completado
4. Admin opens "Privacidad y ARCO" → marks ARCO request as resuelta → `onUpdateArcoStatus(id, "resuelta")`

## Important Notes

- Route protection: enforce `role === 'medico'` server-side
- Audit log must be INSERT-only at the database level
- ARCO requests must be resolved within 20 business days (LFPDPPP)
- FHIR exports must conform to HL7-FHIR R4 minimum: Patient, Condition, MedicationRequest, AllergyIntolerance
- "e.firma SAT" card is decorative (Próximamente) — no action needed

## Testing

See `product-plan/sections/administracion-cumplimiento-interoperabilidad/tests.md`

## Done When

- [ ] Admin panel at `/staff/admin`, accessible to médico role only
- [ ] Dashboard metric cards with real data
- [ ] User table with edit role and toggle status actions
- [ ] Audit log: immutable, filterable
- [ ] FHIR export shows status indicator (en-proceso / completado / error)
- [ ] ARCO requests list with status update
- [ ] Privacy policy download calls `onDownloadPrivacyPolicy`
- [ ] Compliance badges visible: NOM-024-SSA3, LFPDPPP, NOM-035
- [ ] Responsive · Dark mode works
