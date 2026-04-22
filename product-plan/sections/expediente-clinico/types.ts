// ===============================
// Expediente Clínico (EHR) — Types
// ===============================

export type UserRole = 'medico' | 'enfermera'

export type DiagnosisStatus = 'activo' | 'crónico' | 'resuelto'

export type PatientSex = 'masculino' | 'femenino' | 'otro'

// ─── Sub-types ─────────────────────────────────────────────────────────────────

export interface Medication {
  name: string
  dose: string
  frequency: string
  indication: string
}

export interface VitalSigns {
  bloodPressure: string
  heartRate: string
  temperature: string
  weight: string
  height: string
  bmi: string
}

export interface PhysicalExam {
  vitalSigns: VitalSigns
  /** Otoscopy findings for both ears */
  ears: string
  /** Nasal septum, turbinates, sinuses */
  noseAndSinuses: string
  /** Pharynx, larynx, neck nodes, thyroid */
  pharynxAndNeck: string
}

export interface FamilyHistory {
  notes: string
  relevantConditions: string[]
}

export interface PersonalHistory {
  pathological: string
  allergies: string[]
  currentMedications: Medication[]
  nonPathological: string
}

export interface CurrentCondition {
  chiefComplaint: string
  /** ISO date YYYY-MM-DD */
  onset: string
  description: string
  evolution: string
}

export interface Diagnosis {
  id: string
  /** CIE-10 code */
  code: string
  description: string
  status: DiagnosisStatus
  treatment: string
  followUp: string
}

export interface GeneralData {
  fullName: string
  /** ISO date YYYY-MM-DD */
  birthDate: string
  sex: PatientSex
  curp: string
  phone: string
  email: string
  address: string
}

// ─── Main entity ───────────────────────────────────────────────────────────────

export interface Patient {
  id: string
  expedienteNumber: string
  /** ISO timestamp */
  createdAt: string
  /** ISO timestamp */
  updatedAt: string
  generalData: GeneralData
  familyHistory: FamilyHistory
  personalHistory: PersonalHistory
  currentCondition: CurrentCondition
  physicalExam: PhysicalExam
  diagnoses: Diagnosis[]
}

// ─── Props interfaces ──────────────────────────────────────────────────────────

/** Patient list view */
export interface PatientListProps {
  patients: Patient[]
  currentUserRole: UserRole
  /** Called when user selects a patient to view their record */
  onView?: (patientId: string) => void
  /** Called when user initiates creating a new patient record */
  onCreate?: () => void
  /** Called when user types in the search field */
  onSearch?: (query: string) => void
}

/** Patient detail / full record view */
export interface PatientDetailProps {
  patient: Patient
  currentUserRole: UserRole
  /** Called when medico initiates editing the record */
  onEdit?: (patientId: string) => void
  /** Called to go back to the patient list */
  onBack?: () => void
}

/** Create / edit patient record form */
export interface PatientFormProps {
  /** If provided, the form is in edit mode; otherwise create mode */
  patient?: Patient
  currentUserRole: UserRole
  /** Called when form is submitted with complete record data */
  onSubmit?: (data: Omit<Patient, 'id' | 'expedienteNumber' | 'createdAt' | 'updatedAt'>) => void
  /** Called when user cancels the form */
  onCancel?: () => void
}
