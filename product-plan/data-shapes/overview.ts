// =============================================================================
// UI Data Shapes — Combined Reference
//
// These types define the data that UI components expect to receive as props.
// They are a frontend contract, not a database schema. How you model, store,
// and fetch this data on the backend is an implementation decision.
// =============================================================================

// -----------------------------------------------------------------------------
// From: sections/sitio-publico
// -----------------------------------------------------------------------------

export interface EducationEntry {
  degree: string
  institution: string
  year: number
}

export interface DoctorProfile {
  id: string
  fullName: string
  title: string
  licenseNumber: string
  specialtyLicense: string
  photo: string
  tagline: string
  shortBio: string
  fullBio: string
  education: EducationEntry[]
  certifications: string[]
  hospitals: string[]
  yearsOfExperience: number
}

export type ServiceIcon = 'stethoscope' | 'ear' | 'nose' | 'allergen' | 'surgery' | 'balance'

export interface PublicService {
  id: string
  name: string
  icon: ServiceIcon
  shortDescription: string
}

export interface GoogleReview {
  id: string
  authorName: string
  authorInitials: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  date: string
  source: 'Google'
}

export interface GoogleRatingSummary {
  averageRating: number
  totalReviews: number
  placeId: string
  googleMapsUrl: string
}

export interface ScheduleEntry {
  days: string
  hours: string
}

export interface ContactInfo {
  clinicName: string
  address: {
    street: string
    neighborhood: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  phone: string
  whatsapp: string
  email: string
  schedule: ScheduleEntry[]
  googleMapsEmbedUrl: string
  googleMapsDirectionsUrl: string
}

// -----------------------------------------------------------------------------
// From: sections/agenda-de-citas
// -----------------------------------------------------------------------------

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'reprogramada'
export type DayOfWeek = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes'

export interface AppointmentService {
  id: string
  name: string
  /** Duration in minutes */
  duration: number
  description: string
}

export interface Appointment {
  id: string
  patientName: string
  phone: string
  email: string
  serviceId: string
  serviceName: string
  /** ISO date: YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  reason: string
  status: AppointmentStatus
  privacyAccepted: boolean
  /** ISO timestamp */
  createdAt: string
}

export interface TimeSlot {
  /** HH:mm */
  time: string
  available: boolean
}

export interface DayAvailability {
  /** ISO date: YYYY-MM-DD */
  date: string
  dayOfWeek: DayOfWeek
  slots: TimeSlot[]
}

// -----------------------------------------------------------------------------
// From: sections/expediente-clinico
// -----------------------------------------------------------------------------

export type PatientSex = 'masculino' | 'femenino' | 'otro'
export type DiagnosisStatus = 'activo' | 'crónico' | 'resuelto'

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

export interface Patient {
  id: string
  expedienteNumber: string
  createdAt: string
  updatedAt: string
  generalData: {
    fullName: string
    birthDate: string
    sex: PatientSex
    curp: string
    phone: string
    email: string
    address: string
  }
  familyHistory: {
    notes: string
    relevantConditions: string[]
  }
  personalHistory: {
    pathological: string
    allergies: string[]
    currentMedications: Medication[]
    nonPathological: string
  }
  currentCondition: {
    chiefComplaint: string
    onset: string
    description: string
    evolution: string
  }
  physicalExam: {
    vitalSigns: VitalSigns
    ears: string
    noseAndSinuses: string
    pharynxAndNeck: string
  }
  diagnoses: Array<{
    id: string
    code: string
    description: string
    status: DiagnosisStatus
    treatment: string
    followUp: string
  }>
}

// -----------------------------------------------------------------------------
// From: sections/notas-recetas-consentimientos
// -----------------------------------------------------------------------------

export type PrescriptionStatus = 'borrador' | 'firmada'
export type ConsentStatus = 'pendiente' | 'firmado-presencial' | 'firmado-correo' | 'rechazado'
export type SurgicalNoteType = 'preoperatoria' | 'postoperatoria'

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

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  date: string
  status: PrescriptionStatus
  medications: Array<{
    name: string
    presentation: string
    dose: string
    frequency: string
    duration: string
    instructions: string
  }>
  doctorName: string
  doctorLicense: string
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
  signatureMethod: 'presencial' | 'correo' | null
  emailSentAt?: string | null
  authorName: string
  createdAt: string
}

// -----------------------------------------------------------------------------
// From: sections/administracion-cumplimiento-interoperabilidad
// -----------------------------------------------------------------------------

export type UserRole = 'medico' | 'enfermera' | 'recepcionista'
export type UserStatus = 'activo' | 'inactivo'
export type AuditAction = 'acceso' | 'creacion' | 'modificacion' | 'eliminacion' | 'firma' | 'exportacion-fhir'
export type ArcoType = 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion'
export type ArcoStatus = 'pendiente' | 'en-proceso' | 'resuelta' | 'rechazada'

export interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastAccess: string
  createdAt: string
}

export interface AuditLog {
  id: string
  action: AuditAction
  resource: string
  userId: string
  userName: string
  ipAddress: string
  timestamp: string
}

export interface ArcoRequest {
  id: string
  type: ArcoType
  patientName: string
  patientId: string
  description: string
  status: ArcoStatus
  submittedAt: string
  resolvedAt: string | null
  notes: string | null
}

export interface FhirExport {
  id: string
  type: 'individual' | 'masiva'
  patientName: string | null
  patientId: string | null
  dateRangeFrom?: string
  dateRangeTo?: string
  totalPatients?: number
  requestedBy: string
  status: 'en-proceso' | 'completado' | 'error'
  fileSize: string | null
  requestedAt: string
  completedAt: string | null
}
