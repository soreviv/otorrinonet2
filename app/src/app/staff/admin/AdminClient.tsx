'use client'

import { useState } from 'react'
import { AdminDashboard } from '@/components/admin'
import { updateUserRole, updateUserStatus, updateArcoRequestStatus } from '@/app/actions/admin'
import type {
  SystemUser, ArcoRequest, FhirExport, DashboardMetrics, ComplianceBadge,
  AuditLog, PrivacyNotice, UserRole, UserStatus, ArcoStatus,
} from '@/lib/admin-types'

interface Props {
  metrics: DashboardMetrics
  complianceBadges: ComplianceBadge[]
  systemUsers: SystemUser[]
  auditLogs: AuditLog[]
  arcoRequests: ArcoRequest[]
  fhirExports: FhirExport[]
  privacyNotice: PrivacyNotice
}

export function AdminClient({
  metrics: initialMetrics,
  complianceBadges,
  systemUsers: initialUsers,
  auditLogs,
  arcoRequests: initialArco,
  fhirExports,
  privacyNotice,
}: Props) {
  const [users, setUsers] = useState<SystemUser[]>(initialUsers)
  const [arcoRequests, setArcoRequests] = useState<ArcoRequest[]>(initialArco)

  const activeUsers = users.filter(u => u.status === 'activo').length
  const pendingArco = arcoRequests.filter(r => r.status === 'pendiente').length

  const metrics: DashboardMetrics = {
    ...initialMetrics,
    activeUsers,
    pendingArcoRequests: pendingArco,
  }

  async function handleEditUser(userId: string, updates: { role?: UserRole; status?: UserStatus }) {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)))
    if (updates.role) await updateUserRole(userId, updates.role)
    if (updates.status) await updateUserStatus(userId, updates.status)
  }

  async function handleDeactivateUser(userId: string) {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: 'inactivo' } : u)))
    await updateUserStatus(userId, 'inactivo')
  }

  async function handleActivateUser(userId: string) {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: 'activo' } : u)))
    await updateUserStatus(userId, 'activo')
  }

  async function handleUpdateArcoStatus(requestId: string, status: ArcoStatus, notes?: string) {
    setArcoRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status, notes: notes ?? r.notes, resolvedAt: status === 'resuelta' || status === 'rechazada' ? new Date().toISOString() : r.resolvedAt }
          : r,
      ),
    )
    await updateArcoRequestStatus(requestId, status, notes)
  }

  return (
    <AdminDashboard
      metrics={metrics}
      complianceBadges={complianceBadges}
      systemUsers={users}
      auditLogs={auditLogs}
      arcoRequests={arcoRequests}
      fhirExports={fhirExports}
      privacyNotice={privacyNotice}
      onEditUser={handleEditUser}
      onDeactivateUser={handleDeactivateUser}
      onActivateUser={handleActivateUser}
      onExportFhirIndividual={() => {}}
      onExportFhirBulk={() => {}}
      onUpdateArcoStatus={handleUpdateArcoStatus}
      onDownloadPrivacyNotice={() => window.open(privacyNotice.downloadUrl, '_blank')}
    />
  )
}
