# Test Specs: Expediente Clínico (EHR)

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

Electronic health record module with three views: patient list, patient detail (full expediente), and create/edit form. Nurses can view but not edit diagnoses or treatment plans.

---

## User Flow Tests

### Flow 1: Search and Open a Patient Record

**Scenario:** Medical staff searches for a patient by name and opens their expediente.

#### Success Path

**Setup:**
- `patients` has 5+ patients with varied names

**Steps:**
1. User sees the patient list
2. User types "García" in the search box
3. User sees filtered list showing only patients with "García" in their name
4. User clicks on "Carlos García Méndez"

**Expected Results:**
- [ ] `onSearch("García")` is called as user types
- [ ] List filters to matching patients only
- [ ] Clicking the patient calls `onView(patientId)`

#### No Results

**Steps:**
1. User types "Zzzzzz" in the search box

**Expected Results:**
- [ ] `onSearch("Zzzzzz")` is called
- [ ] Empty state shows "No se encontraron pacientes" (or similar)
- [ ] "Nuevo paciente" button remains visible

---

### Flow 2: View a Patient's Full Expediente

**Scenario:** Doctor opens a patient record and reviews the clinical history.

**Setup:**
- `patient` has complete data including diagnoses with CIE-10 codes

**Steps:**
1. User opens patient detail view for "Carlos García Méndez"
2. User sees `expedienteNumber` in the header (e.g., "EXP-2024-001")
3. User sees `updatedAt` timestamp
4. User expands the "Exploración Física" section
5. User sees vital signs: blood pressure, heart rate, temperature, weight, height

**Expected Results:**
- [ ] `expedienteNumber` renders in monospace font
- [ ] Patient's full name, birthdate, sex are visible in datos generales
- [ ] CURP renders in monospace font
- [ ] Diagnoses list shows code (CIE-10) and description
- [ ] Active diagnoses have visual distinction from resolved ones

---

### Flow 3: Create a New Patient Record

**Scenario:** Doctor registers a new patient for the first time.

**Steps:**
1. Doctor clicks "Nuevo Paciente" button
2. `onNew` callback is called

**Expected Results:**
- [ ] `onNew` is called when clicking "Nuevo Paciente"
- [ ] Button is visible in the patient list view

---

### Flow 4: Edit an Existing Patient Record

**Scenario:** Doctor edits a patient's diagnoses and treatment plan.

**Steps:**
1. Doctor opens patient detail
2. Doctor clicks "Editar expediente"
3. `onEdit(patientId)` is called

**Expected Results:**
- [ ] Edit button is visible for the doctor role
- [ ] `onEdit(patientId)` is called with the correct patient ID

---

### Flow 5: Nurse Views Expediente (Role Restriction)

**Scenario:** Nurse views a patient record but cannot edit diagnoses.

**Setup:**
- Active role is "enfermera"

**Steps:**
1. Nurse opens patient detail
2. Nurse views vital signs section
3. Nurse attempts to edit diagnoses section

**Expected Results:**
- [ ] Diagnoses section and treatment plan are visually disabled or read-only
- [ ] Vital signs section is accessible/editable for the nurse role
- [ ] Role badge shows "Enfermera" in the UI

---

## Empty State Tests

### No Patients

**Scenario:** No patients exist in the system yet.

**Setup:**
- `patients` is `[]`

**Expected Results:**
- [ ] Empty state shows heading "Sin expedientes" (or similar)
- [ ] CTA "Registrar primer paciente" (or similar) is visible
- [ ] Clicking CTA calls `onNew`

### Patient With No Diagnoses

**Scenario:** Patient exists but has no diagnoses yet.

**Setup:**
- `patient.diagnoses` is `[]`

**Expected Results:**
- [ ] Diagnoses section renders without error
- [ ] Empty state within the section is shown
- [ ] "Agregar diagnóstico" option is visible for the doctor role

---

## Component Interaction Tests

### PatientList

- [ ] Displays `expedienteNumber` alongside patient name
- [ ] Displays formatted birth date or age
- [ ] `updatedAt` is visible as last-updated indicator
- [ ] Row click calls `onView(id)`
- [ ] Edit action calls `onEdit(id)`

### PatientDetail — Sections

- [ ] "Datos Generales" section is expanded by default
- [ ] Collapsible sections toggle on click
- [ ] `vitalSigns.bloodPressure` renders in monospace font
- [ ] CIE-10 codes render in monospace font
- [ ] `DiagnosisStatus`: activo (green), crónico (amber), resuelto (gray)

---

## Edge Cases

- [ ] Very long patient name renders without overflow in the list and detail header
- [ ] CURP with special characters renders correctly
- [ ] Patient with many diagnoses (10+) scrolls properly
- [ ] Search is case-insensitive (searching "garcia" finds "García")
- [ ] `expedienteNumber` is always unique and displays consistently

---

## Accessibility Checks

- [ ] Search input has a label or `aria-label`
- [ ] Collapsible sections use accessible expand/collapse controls
- [ ] Role restriction is communicated to screen readers (not only by color)
- [ ] Form fields in create/edit have associated labels

---

## Sample Test Data

```typescript
const mockPatient: Patient = {
  id: "pat-001",
  expedienteNumber: "EXP-2024-001",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-06-01T14:30:00Z",
  generalData: {
    fullName: "Carlos García Méndez",
    birthDate: "1985-03-20",
    sex: "masculino",
    curp: "GAMC850320HJCRRL04",
    phone: "331-234-5678",
    email: "carlos@email.com",
    address: "Av. Chapultepec 456, Guadalajara",
  },
  familyHistory: { notes: "Padre con hipertensión", relevantConditions: ["hipertensión"] },
  personalHistory: {
    pathological: "Rinitis alérgica desde los 20 años",
    allergies: ["Ácaros del polvo", "Polen"],
    currentMedications: [{ name: "Loratadina", dose: "10mg", frequency: "Una vez al día", indication: "Rinitis alérgica" }],
    nonPathological: "No fuma, no bebe",
  },
  currentCondition: {
    chiefComplaint: "Pérdida auditiva gradual bilateral",
    onset: "Hace 6 meses",
    description: "Refiere dificultad para escuchar conversaciones en ambientes ruidosos",
    evolution: "Progresiva",
  },
  physicalExam: {
    vitalSigns: { bloodPressure: "120/80", heartRate: "72", temperature: "36.5°C", weight: "80kg", height: "175cm", bmi: "26.1" },
    ears: "Membranas timpánicas íntegras bilaterales",
    noseAndSinuses: "Cornetes nasales con hipertrofia leve",
    pharynxAndNeck: "Sin hallazgos patológicos",
  },
  diagnoses: [{ id: "d1", code: "H90.3", description: "Hipoacusia neurosensorial bilateral", status: "activo", treatment: "Audiometría y valoración para auxiliar auditivo", followUp: "En 3 meses" }],
}
```
