export type PrescriptionStatus = 'borrador' | 'firmada'

export type ConsentStatus = 'pendiente' | 'firmado-presencial' | 'firmado-correo' | 'rechazado'

export type SurgicalNoteType = 'preoperatoria' | 'postoperatoria'

export type SignatureMethod = 'presencial' | 'correo' | null

export interface EvolutionNote {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  consultationReason: string
  findings: string
  updatedDiagnosis: string
  plan: string
  authorName: string
  createdAt: string
}

export interface SurgicalNote {
  id: string
  patientId: string
  patientName: string
  type: SurgicalNoteType
  procedure: string
  scheduledDate: string
  anesthesia: string
  instructions: string
  observations: string
  authorName: string
  createdAt: string
}

export interface PrescriptionMedication {
  /** Denominación genérica — obligatorio NOM */
  name: string
  /** Denominación distintiva / nombre comercial — opcional */
  brandName?: string
  /** Forma farmacéutica y concentración, ej. "Tabletas 500mg" */
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
  date: string
  status: PrescriptionStatus
  medications: PrescriptionMedication[]
  /** Nombre completo sin abreviaturas */
  doctorName: string
  /** Cédula de Médico Cirujano (general) */
  doctorLicense: string
  /** Cédula de Especialidad (ORL) */
  doctorSpecialtyLicense: string
  /** Universidad / institución de egreso de la especialidad */
  doctorUniversity: string
  /** Nombre del consultorio o clínica */
  clinicName: string
  /** Domicilio completo: calle, número, colonia, CP, ciudad */
  clinicAddress: string
  /** Teléfono de contacto */
  clinicPhone: string
  /** Número de aviso de funcionamiento COFEPRIS (recomendado) */
  clinicCofepris?: string
  signatureData: string | null
  signedAt: string | null
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
  patientSignatureData: string | null
  signedAt: string | null
  signatureMethod: SignatureMethod
  emailSentAt?: string | null
  authorName: string
  createdAt: string
}

export interface CurrentPatient {
  id: string
  name: string
  expedienteNumber: string
}

export interface DocumentListProps {
  currentPatient: CurrentPatient
  evolutionNotes: EvolutionNote[]
  surgicalNotes: SurgicalNote[]
  prescriptions: Prescription[]
  consentForms: ConsentForm[]
  onViewNote?: (id: string) => void
  onViewSurgicalNote?: (id: string) => void
  onViewPrescription?: (id: string) => void
  onViewConsent?: (id: string) => void
  onNewNote?: () => void
  onNewSurgicalNote?: () => void
  onNewPrescription?: () => void
  onNewConsent?: () => void
  onBack?: () => void
}

export interface PrescriptionDetailProps {
  prescription: Prescription
  onSign?: (id: string, signatureData: string) => void
  onPrint?: (id: string) => void
  onBack?: () => void
}

export interface ConsentFormDetailProps {
  consent: ConsentForm
  onSignPresential?: (id: string, signatureData: string) => void
  onSendEmail?: (id: string) => void
  onPrint?: (id: string) => void
  onBack?: () => void
}
