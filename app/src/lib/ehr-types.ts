export type UserRole = 'medico' | 'enfermera'

export type PatientSex = 'masculino' | 'femenino' | 'otro'

export interface Medication {
  name: string
  dose: string
  frequency: string
  indication: string
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

export interface GeneralData {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fullName: string
  birthDate: string
  sex: PatientSex
  curp: string
  phone: string
  email: string
  address: string
}

export interface Patient {
  id: string
  expedienteNumber: string
  createdAt: string
  updatedAt: string
  generalData: GeneralData
  familyHistory: FamilyHistory
  personalHistory: PersonalHistory
}

export interface PatientListProps {
  patients: Patient[]
  currentUserRole: UserRole
  onView?: (patientId: string) => void
  onCreate?: () => void
  onSearch?: (query: string) => void
}

export interface PatientDetailProps {
  patient: Patient
  currentUserRole: UserRole
  onEdit?: (patientId: string) => void
  onViewDocuments?: (patientId: string) => void
  onBack?: () => void
}

export interface PatientFormProps {
  patient?: Patient
  currentUserRole: UserRole
  onSubmit?: (data: Omit<Patient, 'id' | 'expedienteNumber' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
}
