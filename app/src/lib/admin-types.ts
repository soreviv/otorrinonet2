export type UserRole = 'medico' | 'enfermera' | 'recepcionista'
export type UserStatus = 'activo' | 'inactivo'
export type AuditAction = 'acceso' | 'creacion' | 'modificacion' | 'eliminacion' | 'firma' | 'exportacion-fhir'
export type ArcoType = 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion'
export type ArcoStatus = 'pendiente' | 'en-proceso' | 'resuelta' | 'rechazada'
export type FhirExportType = 'individual' | 'masiva'
export type FhirExportStatus = 'en-proceso' | 'completado' | 'error'
export type ComplianceStatus = 'cumple' | 'advertencia' | 'incumple'

export interface DashboardMetrics {
  activeUsers: number
  accessesLast24h: number
  fhirExportsThisMonth: number
  pendingArcoRequests: number
  encryptionActive: boolean
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
  lastAccess: string
  createdAt: string
}

export interface AuditLog {
  id: string
  action: AuditAction
  resource: string
  userId: string | null
  userName: string
  ipAddress: string | null
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
  type: FhirExportType
  patientName: string | null
  patientId: string | null
  dateRangeFrom?: string
  dateRangeTo?: string
  totalPatients?: number
  requestedBy: string
  status: FhirExportStatus
  fileSize: string | null
  requestedAt: string
  completedAt: string | null
}

export interface PrivacyNotice {
  version: string
  effectiveDate: string
  lastUpdated: string
  responsible: string
  address: string
  email: string
  downloadUrl: string
}

export interface AdminDashboardProps {
  metrics: DashboardMetrics
  complianceBadges: ComplianceBadge[]
  systemUsers: SystemUser[]
  auditLogs: AuditLog[]
  arcoRequests: ArcoRequest[]
  fhirExports: FhirExport[]
  privacyNotice: PrivacyNotice

  onEditUser?: (userId: string, updates: { role?: UserRole; status?: UserStatus }) => void
  onDeactivateUser?: (userId: string) => void
  onActivateUser?: (userId: string) => void
  onExportFhirIndividual?: (patientId: string) => void
  onExportFhirBulk?: (dateFrom: string, dateTo: string) => void
  onUpdateArcoStatus?: (requestId: string, status: ArcoStatus, notes?: string) => void
  onDownloadPrivacyNotice?: () => void
}
