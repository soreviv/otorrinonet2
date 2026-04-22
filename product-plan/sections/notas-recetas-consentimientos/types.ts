// ============================================
// Notas, Recetas y Consentimientos — Types
// ============================================

export type PrescriptionStatus = 'borrador' | 'firmada'

export type ConsentStatus = 'pendiente' | 'firmado-presencial' | 'firmado-correo' | 'rechazado'

export type SurgicalNoteType = 'preoperatoria' | 'postoperatoria'

export type SignatureMethod = 'presencial' | 'correo' | null

// ─── Documents ────────────────────────────────────────────────────────────────

export interface EvolutionNote {
  id: string
  patientId: string
  patientName: string
  /** ISO date YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  consultationReason: string
  findings: string
  updatedDiagnosis: string
  plan: string
  authorName: string
  /** ISO timestamp with timezone offset */
  createdAt: string
}

export interface SurgicalNote {
  id: string
  patientId: string
  patientName: string
  type: SurgicalNoteType
  procedure: string
  /** ISO date YYYY-MM-DD */
  scheduledDate: string
  anesthesia: string
  instructions: string
  observations: string
  authorName: string
  createdAt: string
}

export interface PrescriptionMedication {
  name: string
  presentation: string
  dose: string
  frequency: string
  duration: string
  instructions: string
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  /** ISO date YYYY-MM-DD */
  date: string
  status: PrescriptionStatus
  medications: PrescriptionMedication[]
  doctorName: string
  doctorLicense: string
  /** Base64 PNG of the doctor's drawn signature, null if not signed yet */
  signatureData: string | null
  /** ISO timestamp with timezone — displayed per Mexican NOM */
  signedAt: string | null
  /** UTC ISO timestamp for audit trail */
  signatureTimestamp: string | null
  createdAt: string
}

export interface ConsentForm {
  id: string
  patientId: string
  patientName: string
  procedure: string
  consentText: string
  status: ConsentStatus
  /** Base64 PNG of patient's drawn signature */
  patientSignatureData: string | null
  signedAt: string | null
  signatureMethod: SignatureMethod
  /** Set when status is 'pendiente' and an email was sent */
  emailSentAt?: string | null
  authorName: string
  createdAt: string
}

// ─── Props interfaces ──────────────────────────────────────────────────────────

export interface CurrentPatient {
  id: string
  name: string
  expedienteNumber: string
}

/** Documents list for a patient */
export interface DocumentListProps {
  currentPatient: CurrentPatient
  evolutionNotes: EvolutionNote[]
  surgicalNotes: SurgicalNote[]
  prescriptions: Prescription[]
  consentForms: ConsentForm[]
  /** Called to view a specific document */
  onViewNote?: (id: string) => void
  onViewSurgicalNote?: (id: string) => void
  onViewPrescription?: (id: string) => void
  onViewConsent?: (id: string) => void
  /** Called to create a new document */
  onNewNote?: () => void
  onNewSurgicalNote?: () => void
  onNewPrescription?: () => void
  onNewConsent?: () => void
  /** Called to go back to the patient record */
  onBack?: () => void
}

/** Prescription detail with signature canvas */
export interface PrescriptionDetailProps {
  prescription: Prescription
  /** Called when doctor draws and submits signature — data is base64 PNG */
  onSign?: (id: string, signatureData: string) => void
  /** Called to print/download the signed prescription */
  onPrint?: (id: string) => void
  onBack?: () => void
}

/** Consent form with patient signature options */
export interface ConsentFormDetailProps {
  consent: ConsentForm
  /** Called when patient signs in-person — data is base64 PNG */
  onSignPresential?: (id: string, signatureData: string) => void
  /** Called to send signing link by email */
  onSendEmail?: (id: string) => void
  /** Called to print/download the signed consent */
  onPrint?: (id: string) => void
  onBack?: () => void
}
