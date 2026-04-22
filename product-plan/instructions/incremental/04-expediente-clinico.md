# Milestone 4: Expediente Clínico (EHR)

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1 (Shell) and 3 (Agenda) complete

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

## Goal

Implement the electronic health record (EHR) module: a searchable patient list, a full expediente detail view, and a create/edit form — all structured per NOM-004-SSA3.

## Overview

The EHR stores complete clinical histories for each patient. The doctor creates and edits full records; nurses can update vital signs but not diagnoses or treatment plans. The expediente number (`expedienteNumber`) is auto-assigned and immutable.

**Key Functionality:**
- Searchable patient list by name or expediente number
- Full expediente detail with collapsible sections (datos generales, antecedentes, padecimiento actual, exploración física ORL, diagnósticos)
- Create new patient record (blank form)
- Edit existing patient record
- Role-based field restrictions (enfermera cannot edit diagnoses or treatment plan)

## Components Provided

Copy from `product-plan/sections/expediente-clinico/components/`:

- `PatientList` — Searchable patient list with expediente number and quick access
- `PatientDetail` — Full expediente view with collapsible NOM-004 sections
- `PatientForm` — Create/edit form organized by section
- `index.ts` — Clean export

## Props Reference

**Key types:**

```typescript
type PatientSex = 'masculino' | 'femenino' | 'otro'
type DiagnosisStatus = 'activo' | 'crónico' | 'resuelto'

interface VitalSigns { bloodPressure, heartRate, temperature, weight, height, bmi }
interface Medication { name, dose, frequency, indication }
interface Patient {
  id, expedienteNumber, createdAt, updatedAt,
  generalData: { fullName, birthDate, sex, curp, phone, email, address },
  familyHistory: { notes, relevantConditions },
  personalHistory: { pathological, allergies, currentMedications, nonPathological },
  currentCondition: { chiefComplaint, onset, description, evolution },
  physicalExam: { vitalSigns, ears, noseAndSinuses, pharynxAndNeck },
  diagnoses: Array<{ id, code, description, status, treatment, followUp }>
}
```

**Callback props:**

| Callback | Triggered When |
|----------|---------------|
| `onView(id)` | User clicks to view a patient's full expediente |
| `onEdit(id)` | User clicks to edit a patient record |
| `onNew()` | User clicks to create a new patient |
| `onSearch(query)` | User types in the search box |
| `onSave(patient)` | User submits the create/edit form |
| `onCancel()` | User cancels the form |

## Expected User Flows

### Flow 1: Find and Open a Patient Record

1. Doctor navigates to `/staff/ehr`
2. Doctor types a patient name in the search box
3. Doctor clicks on the matching patient
4. **Outcome:** `onView(id)` called; full expediente opens

### Flow 2: Create a New Patient

1. Doctor clicks "Nuevo Paciente"
2. Doctor fills in all required sections of the form
3. Doctor clicks "Guardar"
4. **Outcome:** `onSave(newPatient)` called; new expediente is created

### Flow 3: Nurse Updates Vital Signs

1. Nurse opens a patient's expediente
2. Nurse sees vital signs section is editable
3. Nurse sees diagnoses section is read-only (locked)
4. **Outcome:** Role restriction enforced based on `staffUser.role`

## Important Backend Notes

- `expedienteNumber` should be auto-generated (e.g., "EXP-2025-001") and never editable
- Store `updatedAt` on every save; display it prominently in the expediente header
- Role enforcement: pass the active role to the component and enforce server-side as well
- CURP validation is a Mexico-specific 18-character checksum — validate server-side
- CIE-10 codes are international standard diagnosis codes; consider a lookup/autocomplete field

## Empty States

- No patients: show "Sin expedientes" with "Registrar primer paciente" CTA
- Patient with no diagnoses: show "Sin diagnósticos" in that section

## Testing

See `product-plan/sections/expediente-clinico/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/expediente-clinico/README.md` — Feature overview
- `product-plan/sections/expediente-clinico/tests.md` — UI behavior test specs
- `product-plan/sections/expediente-clinico/components/` — React components
- `product-plan/sections/expediente-clinico/types.ts` — TypeScript interfaces
- `product-plan/sections/expediente-clinico/sample-data.json` — Test data
- `product-plan/sections/expediente-clinico/PatientList.png` — Visual reference
- `product-plan/sections/expediente-clinico/PatientDetail.png` — Visual reference
- `product-plan/sections/expediente-clinico/PatientForm.png` — Visual reference

## Done When

- [ ] Patient list renders at `/staff/ehr` inside the staff shell
- [ ] Search filters patients in real time
- [ ] Patient detail view shows all NOM-004 sections
- [ ] CURP and CIE-10 codes render in monospace font
- [ ] Create/edit form allows saving via `onSave(patient)`
- [ ] Role restriction: enfermera cannot edit diagnoses or treatment plan
- [ ] `expedienteNumber` and `updatedAt` visible in the detail header
- [ ] Diagnosis status: activo (green), crónico (amber), resuelto (gray)
- [ ] Responsive on mobile
