export type PrescriptionStatus = 'borrador' | 'firmada'

export type ConsentStatus = 'pendiente' | 'firmado-presencial' | 'firmado-correo' | 'rechazado'

export type SignatureMethod = 'presencial' | 'correo' | null

export interface NoteAddendum {
  id: string
  contenido: string
  authorName: string
  fecha: string
  firmaHash: string | null
}

export interface NoteDiagnostico {
  codigo: string
  descripcion: string
  tipo: string
}

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
  diagnosticos: NoteDiagnostico[]
  authorName: string
  authorId: string | null
  signed: boolean
  signedAt: string | null
  firmaHash: string | null
  firmaUserId: string | null
  addendums: NoteAddendum[]
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
  /** Vía de administración, ej. "Oral", "Sublingual", "Tópica" */
  route?: string
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  date: string
  status: PrescriptionStatus
  medications: PrescriptionMedication[]
  doctorName: string
  doctorLicense: string
  doctorSpecialtyLicense: string
  doctorUniversity: string
  doctorUniversityLogoUrl?: string | null
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicEmail?: string | null
  clinicLogoUrl?: string | null
  clinicCofepris?: string
  signatureData: string | null
  signedAt: string | null
  signatureTimestamp: string | null
  firmaHash?: string | null
  createdAt: string
  /** Diagnóstico médico (instruccionesGenerales en BD) */
  diagnosis?: string
  /** Edad calculada al momento de expedir la receta */
  patientAge?: number
  /** Sexo del paciente */
  patientSex?: string
  /** Alergias conocidas */
  patientAllergies?: string[]
  /** Último peso registrado (kg) */
  patientWeight?: number
  /** Última talla registrada (cm) */
  patientHeight?: number
  /** IMC calculado */
  patientBMI?: number
  /** Última temperatura registrada (°C) */
  patientTemperature?: number
  /** Presión arterial, ej. "120/80 mmHg" */
  patientBloodPressure?: string
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
  prescriptions: Prescription[]
  consentForms: ConsentForm[]
  onViewNote?: (id: string) => void
  onViewPrescription?: (id: string) => void
  onViewConsent?: (id: string) => void
  onNewNote?: () => void
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
