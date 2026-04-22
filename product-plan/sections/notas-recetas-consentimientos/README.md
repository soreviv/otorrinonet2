# Notas, Recetas y Consentimientos

## Overview

Módulo para generar y gestionar los documentos clínicos asociados a cada paciente: notas de evolución, notas preoperatorias/postoperatorias, recetas médicas digitales con firma electrónica y timestamp, y consentimientos informados firmados por el paciente presencialmente o por correo.

## User Flows

- Médico accede a los documentos de un paciente desde su expediente clínico
- Médico crea una nota de evolución con los datos de la consulta actual
- Médico crea una nota preoperatoria o postoperatoria para pacientes de cirugía
- Médico genera una receta médica y la firma con canvas de firma digital; queda sellada con timestamp inmutable
- Médico crea un consentimiento informado seleccionando el tipo de procedimiento
- Paciente firma el consentimiento presencialmente (canvas en pantalla) o por correo (enlace enviado)
- Médico visualiza e imprime cualquier documento generado

## Design Decisions

- Documents are grouped by type in the list: notas evolución, notas quirúrgicas, recetas, consentimientos
- Signed prescriptions show a lock icon and are visually non-editable
- `signatureData` stores base64 canvas image; `signedAt` + `signatureTimestamp` store the immutable timestamp
- `ConsentStatus`: `pendiente` → `firmado-presencial` | `firmado-correo` | `rechazado`
- Two consent signing paths: canvas on-screen (presencial) or email link (`onSendConsentEmail`)
- Print/download only available for signed/finalized documents

## Data Shapes

**Entities:** `EvolutionNote`, `SurgicalNote`, `SurgicalNoteType`, `Prescription`, `PrescriptionStatus`, `ConsentForm`, `ConsentStatus`

## Visual Reference

See `DocumentList.png`, `PrescriptionDetail.png`, and `ConsentFormDetail.png` for the target UI design.

## Components Provided

- `DocumentList` — Grouped list of all clinical documents for a patient
- `PrescriptionDetail` — Prescription view with signature canvas and timestamp
- `ConsentFormDetail` — Consent form view with dual signing paths

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onViewNote(id)` | User clicks to view an evolution note |
| `onNewNote()` | User clicks to create a new evolution note |
| `onViewPrescription(id)` | User clicks to view a prescription |
| `onNewPrescription()` | User clicks to create a new prescription |
| `onSignPrescription(id, signatureData)` | Doctor submits the signature canvas |
| `onViewConsent(id)` | User clicks to view a consent form |
| `onNewConsent()` | User clicks to create a new consent form |
| `onSignConsent(id, signatureData)` | Patient signs on-screen |
| `onSendConsentEmail(id)` | Doctor sends consent link by email |
| `onPrint(id)` | User clicks print/download on a signed document |
