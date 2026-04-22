# Test Specs: Notas, Recetas y Consentimientos

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

Clinical document management module. Key functionality: grouped document list, prescription signing with canvas, immutable signed documents, and dual-path consent signing (on-screen or by email).

---

## User Flow Tests

### Flow 1: Doctor Signs a Prescription

**Scenario:** Doctor creates a prescription and signs it with the digital canvas.

#### Success Path

**Setup:**
- A prescription exists with `status: "borrador"` for the patient

**Steps:**
1. Doctor views the prescription in draft state
2. Doctor sees the signature canvas
3. Doctor draws a signature on the canvas
4. Doctor clicks "Firmar receta"
5. `onSignPrescription(prescriptionId, signatureData)` is called

**Expected Results:**
- [ ] `onSignPrescription` is called with the prescription ID and base64 signature data
- [ ] After signing, a lock icon is displayed
- [ ] `signedAt` timestamp is visible with date, time, and timezone
- [ ] Prescription is displayed as immutable (no edit button visible)
- [ ] "Imprimir" button appears after signing

#### Cannot Edit Signed Prescription

**Steps:**
1. Doctor views a prescription with `status: "firmada"`

**Expected Results:**
- [ ] No edit button is visible
- [ ] Lock icon is visible
- [ ] Timestamp shows `signedAt` value

---

### Flow 2: Patient Signs Consent On-Screen (Presencial)

**Scenario:** Patient signs a consent form on a tablet in the doctor's office.

**Setup:**
- Consent form exists with `status: "pendiente"`

**Steps:**
1. Doctor opens consent form detail
2. Doctor hands tablet to patient
3. Patient draws signature on the canvas
4. Patient clicks "Firmar consentimiento"
5. `onSignConsent(consentId, signatureData)` is called

**Expected Results:**
- [ ] `onSignConsent` is called with consent ID and base64 signature
- [ ] Consent status changes to "firmado-presencial"
- [ ] Signed timestamp is displayed
- [ ] "Imprimir" button appears

---

### Flow 3: Doctor Sends Consent by Email

**Scenario:** Doctor sends a consent form link to the patient's email for remote signing.

**Setup:**
- Consent form exists with `status: "pendiente"`
- Patient has `email` filled in

**Steps:**
1. Doctor opens consent form detail
2. Doctor clicks "Enviar por correo"
3. `onSendConsentEmail(consentId)` is called

**Expected Results:**
- [ ] `onSendConsentEmail` is called with the consent ID
- [ ] UI indicates email was sent (e.g., "Correo enviado" message or status badge change)

---

### Flow 4: Print a Signed Document

**Scenario:** Doctor prints a signed prescription or consent.

**Setup:**
- Document exists with signed/finalized status

**Steps:**
1. Doctor opens signed document
2. Doctor clicks "Imprimir / Descargar"
3. `onPrint(documentId)` is called

**Expected Results:**
- [ ] `onPrint` is called with the document ID
- [ ] Print button is only visible on signed/finalized documents

---

## Empty State Tests

### No Documents for Patient

**Scenario:** Patient has no clinical documents yet.

**Setup:**
- All document arrays are empty: `evolutionNotes: []`, `surgicalNotes: []`, `prescriptions: []`, `consentForms: []`

**Expected Results:**
- [ ] Each document group shows an empty state
- [ ] "Nueva nota", "Nueva receta", "Nuevo consentimiento" CTAs are visible
- [ ] Clicking each CTA calls the respective `onNew*` callback

### No Prescriptions

**Scenario:** Patient has no prescriptions.

**Setup:**
- `prescriptions` is `[]`

**Expected Results:**
- [ ] Prescriptions section shows empty state
- [ ] "Nueva receta" button is visible and calls `onNewPrescription`

---

## Component Interaction Tests

### DocumentList — Grouping and Badges

- [ ] Documents are grouped by type with section headers
- [ ] "borrador" prescriptions show a draft badge
- [ ] "firmada" prescriptions show a green/locked badge
- [ ] "pendiente" consent forms show a yellow badge
- [ ] "firmado-presencial" and "firmado-correo" show green badges
- [ ] "rechazado" consent forms show a red badge

### DocumentList — Actions

- [ ] Clicking a document calls the appropriate `onView*` callback
- [ ] "Nueva nota" button calls `onNewNote`
- [ ] "Nueva receta" button calls `onNewPrescription`
- [ ] "Nuevo consentimiento" button calls `onNewConsent`

### PrescriptionDetail — Canvas

- [ ] Signature canvas is visible for draft prescriptions
- [ ] Canvas is NOT rendered for signed prescriptions
- [ ] "Firmar receta" button is disabled when canvas is empty

---

## Edge Cases

- [ ] Prescription with many medications (10+) scrolls properly
- [ ] Very long consent text renders with proper line wrapping
- [ ] Signed timestamp displays in Mexico City timezone
- [ ] Immutability: signed prescription does not show edit controls even for the doctor role
- [ ] Email button shows disabled state if patient has no email address

---

## Accessibility Checks

- [ ] Signature canvas has `aria-label` describing its purpose
- [ ] Status badges communicate status via text, not just color
- [ ] "Imprimir" button is keyboard accessible
- [ ] Document type section headings are proper heading elements

---

## Sample Test Data

```typescript
const mockDraftPrescription: Prescription = {
  id: "rx-001",
  patientId: "pat-001",
  patientName: "Carlos García Méndez",
  date: "2025-06-15",
  status: "borrador",
  medications: [
    { name: "Loratadina", presentation: "Comprimidos 10mg", dose: "10mg", frequency: "Una vez al día", duration: "30 días", instructions: "Tomar por la mañana" },
  ],
  doctorName: "Dr. Alejandro Viveros Domínguez",
  doctorLicense: "12345678",
  signatureData: null,
  signedAt: null,
  signatureTimestamp: null,
  createdAt: "2025-06-15T10:00:00Z",
}

const mockSignedPrescription: Prescription = {
  ...mockDraftPrescription,
  id: "rx-002",
  status: "firmada",
  signatureData: "data:image/png;base64,...",
  signedAt: "2025-06-15T10:30:00Z",
  signatureTimestamp: "2025-06-15T10:30:00 CDT (UTC-5)",
}

const mockPendingConsent: ConsentForm = {
  id: "cf-001",
  patientId: "pat-001",
  patientName: "Carlos García Méndez",
  procedure: "Septoplastia funcional",
  consentText: "Yo, Carlos García Méndez, autorizo al Dr. Alejandro Viveros a realizar el procedimiento...",
  status: "pendiente",
  patientSignatureData: null,
  signedAt: null,
  signatureMethod: null,
  authorName: "Dr. Alejandro Viveros Domínguez",
  createdAt: "2025-06-15T09:00:00Z",
}
```
