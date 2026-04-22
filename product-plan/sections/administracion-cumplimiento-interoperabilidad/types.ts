// =====================================================================
// Administración, Cumplimiento e Interoperabilidad — Types
// =====================================================================

export type UserRole = 'medico' | 'enfermera' | 'recepcionista'
export type UserStatus = 'activo' | 'inactivo'
export type AuditAction = 'acceso' | 'creacion' | 'modificacion' | 'eliminacion' | 'firma' | 'exportacion-fhir'
export type ArcoType = 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion'
export type ArcoStatus = 'pendiente' | 'en-proceso' | 'resuelta' | 'rechazada'
export type FhirExportType = 'individual' | 'masiva'
export type FhirExportStatus = 'en-proceso' | 'completado' | 'error'
export type ComplianceStatus = 'cumple' | 'advertencia' | 'incumple'

// ─── Entities ──────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  activeUsers: number
  accessesLast24h: number
  fhirExportsThisMonth: number
  pendingArcoRequests: number
  encryptionActive: boolean
  /** ISO timestamp */
  lastBackup: string
  systemStatus: 'ok' | 'warning' | 'error'
}

export interface ComplianceBadge {
  id: string
  label: string
  description: string
  status: ComplianceStatus
}

export interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  /** ISO timestamp */
  lastAccess: string
  /** ISO timestamp */
  createdAt: string
}

export interface AuditLog {
  id: string
  action: AuditAction
  resource: string
  userId: string
  userName: string
  ipAddress: string
  /** ISO timestamp */
  timestamp: string
}

export interface ArcoRequest {
  id: string
  type: ArcoType
  patientName: string
  patientId: string
  description: string
  status: ArcoStatus
  /** ISO timestamp */
  submittedAt: string
  /** ISO timestamp, null if not resolved */
  resolvedAt: string | null
  notes: string | null
}

export interface FhirExport {
  id: string
  type: FhirExportType
  patientName: string | null
  patientId: string | null
  /** ISO date YYYY-MM-DD — only for masiva */
  dateRangeFrom?: string
  /** ISO date YYYY-MM-DD — only for masiva */
  dateRangeTo?: string
  totalPatients?: number
  requestedBy: string
  status: FhirExportStatus
  fileSize: string | null
  /** ISO timestamp */
  requestedAt: string
  /** ISO timestamp, null if not completed */
  completedAt: string | null
}

export interface PrivacyNotice {
  version: string
  /** ISO date YYYY-MM-DD */
  effectiveDate: string
  /** ISO date YYYY-MM-DD */
  lastUpdated: string
  responsible: string
  address: string
  email: string
  downloadUrl: string
}

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface AdminDashboardProps {
  metrics: DashboardMetrics
  complianceBadges: ComplianceBadge[]
  systemUsers: SystemUser[]
  auditLogs: AuditLog[]
  arcoRequests: ArcoRequest[]
  fhirExports: FhirExport[]
  privacyNotice: PrivacyNotice

  /** Called to edit a user's role or status */
  onEditUser?: (userId: string, updates: { role?: UserRole; status?: UserStatus }) => void
  /** Called to deactivate a user */
  onDeactivateUser?: (userId: string) => void
  /** Called to activate a previously inactive user */
  onActivateUser?: (userId: string) => void
  /** Called to export a single patient's record as HL7-FHIR */
  onExportFhirIndividual?: (patientId: string) => void
  /** Called to export multiple records with date filters */
  onExportFhirBulk?: (dateFrom: string, dateTo: string) => void
  /** Called to update an ARCO request status */
  onUpdateArcoStatus?: (requestId: string, status: ArcoStatus, notes?: string) => void
  /** Called to download the privacy notice PDF */
  onDownloadPrivacyNotice?: () => void
}
