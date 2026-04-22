# Milestone 5: Notas, Recetas y Consentimientos

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1 (Shell) and 4 (Expediente Clínico) complete

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

Implement clinical document generation: evolution notes, surgical notes, digital prescriptions with signature, and consent forms with dual-path patient signing.

## Overview

Accessed from a patient's expediente, this module generates and manages all clinical documents. Prescriptions use a canvas-based signature and are immutable once signed. Consent forms support two signing paths: on-screen (presencial) or by email link. All signed documents include a legal timestamp.

**Key Functionality:**
- Grouped document list: notas de evolución, notas quirúrgicas, recetas, consentimientos
- Create evolution notes (SOAP-style: motivo, hallazgos, diagnóstico, plan)
- Create surgical notes (preoperatoria / postoperatoria)
- Generate and sign prescriptions with canvas signature + timestamp
- Generate consent forms and collect patient signature (on-screen or by email link)
- Print/download signed documents

## Components Provided

Copy from `product-plan/sections/notas-recetas-consentimientos/components/`:

- `DocumentList` — Grouped list of all clinical documents for a patient
- `PrescriptionDetail` — Prescription view with canvas signature and timestamp
- `ConsentFormDetail` — Consent view with on-screen canvas or email signing
- `index.ts` — Clean export

## Props Reference

**Key types:**

```typescript
type PrescriptionStatus = 'borrador' | 'firmada'
type ConsentStatus = 'pendiente' | 'firmado-presencial' | 'firmado-correo' | 'rechazado'
type SurgicalNoteType = 'preoperatoria' | 'postoperatoria'

interface Prescription { id, patientId, patientName, date, status, medications, doctorName, doctorLicense, signatureData, signedAt, signatureTimestamp, createdAt }
interface ConsentForm { id, patientId, patientName, procedure, consentText, status, patientSignatureData, signedAt, signatureMethod, emailSentAt, authorName, createdAt }
```

**Callback props:**

| Callback | Triggered When |
|----------|---------------|
| `onNewNote()` | Doctor creates an evolution note |
| `onSignPrescription(id, signatureData)` | Doctor signs the prescription canvas |
| `onNewPrescription()` | Doctor creates a new prescription |
| `onNewConsent()` | Doctor creates a new consent form |
| `onSignConsent(id, signatureData)` | Patient signs on-screen |
| `onSendConsentEmail(id)` | Doctor sends consent link by email |
| `onPrint(id)` | User prints/downloads a signed document |

## Expected User Flows

### Flow 1: Doctor Signs a Prescription

1. Doctor opens a draft prescription
2. Doctor draws signature on the canvas
3. Doctor clicks "Firmar receta"
4. **Outcome:** `onSignPrescription(id, base64Data)` called; prescription becomes immutable with lock icon and timestamp

### Flow 2: Patient Signs Consent On-Screen

1. Doctor opens a pending consent form
2. Doctor hands tablet to patient
3. Patient draws signature on the canvas
4. Patient clicks "Firmar consentimiento"
5. **Outcome:** `onSignConsent(id, base64Data)` called; status becomes "firmado-presencial"

### Flow 3: Doctor Sends Consent by Email

1. Doctor opens a pending consent form
2. Doctor clicks "Enviar por correo"
3. **Outcome:** `onSendConsentEmail(id)` called; email sent to patient's address; status shows "correo enviado"

## Important Backend Notes

- **Immutability is a legal requirement**: once `status === "firmada"` or consent is signed, the document must not be editable in the database
- `signatureTimestamp` should include timezone: e.g., `"2025-06-15T10:30:00 CDT (UTC-5)"` — this is required for Mexican medical records compliance
- For email consent: generate a unique, expiring token; the signing endpoint should set `status = 'firmado-correo'` when the patient signs via the link
- `signatureData` is a base64 PNG from the canvas — store it and render it as an `<img>` tag when displaying signed documents

## Empty States

- No documents for patient: each document type section shows an empty state with a "Crear" CTA
- Draft prescription with empty canvas: "Firmar" button is disabled

## Testing

See `product-plan/sections/notas-recetas-consentimientos/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/notas-recetas-consentimientos/README.md` — Feature overview
- `product-plan/sections/notas-recetas-consentimientos/tests.md` — UI behavior test specs
- `product-plan/sections/notas-recetas-consentimientos/components/` — React components
- `product-plan/sections/notas-recetas-consentimientos/types.ts` — TypeScript interfaces
- `product-plan/sections/notas-recetas-consentimientos/sample-data.json` — Test data
- `product-plan/sections/notas-recetas-consentimientos/DocumentList.png` — Visual reference
- `product-plan/sections/notas-recetas-consentimientos/PrescriptionDetail.png` — Visual reference
- `product-plan/sections/notas-recetas-consentimientos/ConsentFormDetail.png` — Visual reference

## Done When

- [ ] Document list renders grouped by type for a patient
- [ ] Document status badges render correctly for all statuses
- [ ] Draft prescription shows canvas; signed prescription shows lock + timestamp
- [ ] Signing prescription calls `onSignPrescription` with base64 data
- [ ] Consent form shows canvas for on-screen signing
- [ ] "Enviar por correo" calls `onSendConsentEmail`
- [ ] Print/download button visible and calls `onPrint` for signed documents only
- [ ] Signed documents are visually non-editable
- [ ] Timestamp shows date + time + timezone (e.g., CDT/CST Mexico City)
- [ ] Responsive on mobile
