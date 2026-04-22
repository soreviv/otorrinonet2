# Expediente Clínico (EHR)

## Overview

Historia clínica electrónica estructurada conforme a NOM-004-SSA3. Permite al médico y a la enfermera consultar, crear y actualizar expedientes con datos generales, antecedentes, padecimiento actual, exploración física ORL y plan de tratamiento.

## User Flows

- Médico o enfermera busca un paciente desde la lista por nombre o número de expediente
- Médico accede al detalle del expediente para revisar el historial clínico completo
- Médico crea un nuevo expediente al registrar un paciente por primera vez
- Médico edita un expediente existente para actualizar antecedentes, diagnósticos o plan
- Enfermera accede al expediente para registrar o actualizar signos vitales
- Enfermera puede ver el expediente completo pero no puede editar diagnósticos ni plan

## Design Decisions

- Expediente sections are collapsible; default expanded: datos generales + diagnósticos
- Nurse role visually disables (not hides) the diagnoses and treatment plan fields
- `expedienteNumber` is auto-assigned, shown in the header with `font-mono`
- CURP, CIE-10 codes, and vital signs use IBM Plex Mono for visual distinction
- `onNew` opens blank form; `onEdit(id)` opens populated form for the given patient

## Data Shapes

**Entities:** `Patient`, `PatientSex`, `DiagnosisStatus`, `Medication`, `VitalSigns`

## Visual Reference

See `PatientList.png`, `PatientDetail.png`, and `PatientForm.png` for the target UI design.

## Components Provided

- `PatientList` — Searchable list of patients with expediente number and quick access
- `PatientDetail` — Full expediente view with collapsible sections
- `PatientForm` — Create / edit form organized by NOM-004 sections

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onView(id)` | User clicks to view a patient's full expediente |
| `onEdit(id)` | User clicks to edit a patient record |
| `onNew()` | User clicks to create a new patient record |
| `onSearch(query)` | User types in the search box |
| `onSave(patient)` | User submits the create/edit form |
| `onCancel()` | User cancels the form |
