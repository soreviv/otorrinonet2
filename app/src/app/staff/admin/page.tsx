'use client'

import { useState } from 'react'
import { AdminDashboard } from '@/components/admin'
import {
  SAMPLE_METRICS,
  SAMPLE_COMPLIANCE_BADGES,
  SAMPLE_SYSTEM_USERS,
  SAMPLE_AUDIT_LOGS,
  SAMPLE_ARCO_REQUESTS,
  SAMPLE_FHIR_EXPORTS,
  SAMPLE_PRIVACY_NOTICE,
} from '@/lib/admin-data'
import type { SystemUser, ArcoRequest, FhirExport, UserRole, UserStatus, ArcoStatus } from '@/lib/admin-types'

const CURRENT_ROLE: UserRole = 'medico'

export default function AdminPage() {
  if (CURRENT_ROLE !== 'medico') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Acceso restringido al médico administrador.</p>
        </div>
      </div>
    )
  }

  return <AdminContent />
}

function AdminContent() {
  const [users, setUsers] = useState<SystemUser[]>(SAMPLE_SYSTEM_USERS)
  const [arcoRequests, setArcoRequests] = useState<ArcoRequest[]>(SAMPLE_ARCO_REQUESTS)
  const [fhirExports, setFhirExports] = useState<FhirExport[]>(SAMPLE_FHIR_EXPORTS)

  const activeUsers = users.filter(u => u.status === 'activo').length
  const pendingArco = arcoRequests.filter(r => r.status === 'pendiente').length

  const metrics = {
    ...SAMPLE_METRICS,
    activeUsers,
    pendingArcoRequests: pendingArco,
    fhirExportsThisMonth: fhirExports.filter(e => {
      const d = new Date(e.requestedAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
  }

  function handleEditUser(userId: string, updates: { role?: UserRole; status?: UserStatus }) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
  }

  function handleDeactivateUser(userId: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'inactivo' } : u))
  }

  function handleActivateUser(userId: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'activo' } : u))
  }

  function handleExportFhirIndividual(patientId: string) {
    const newExport: FhirExport = {
      id: `fhir-${Date.now()}`,
      type: 'individual',
      patientName: patientId,
      patientId,
      requestedBy: 'Dr. Alejandro Viveros Domínguez',
      status: 'en-proceso',
      fileSize: null,
      requestedAt: new Date().toISOString(),
      completedAt: null,
    }
    setFhirExports(prev => [newExport, ...prev])
  }

  function handleExportFhirBulk(dateFrom: string, dateTo: string) {
    const newExport: FhirExport = {
      id: `fhir-${Date.now()}`,
      type: 'masiva',
      patientName: null,
      patientId: null,
      dateRangeFrom: dateFrom,
      dateRangeTo: dateTo,
      requestedBy: 'Dr. Alejandro Viveros Domínguez',
      status: 'en-proceso',
      fileSize: null,
      requestedAt: new Date().toISOString(),
      completedAt: null,
    }
    setFhirExports(prev => [newExport, ...prev])
  }

  function handleUpdateArcoStatus(requestId: string, status: ArcoStatus, notes?: string) {
    setArcoRequests(prev => prev.map(r =>
      r.id === requestId
        ? {
            ...r,
            status,
            notes: notes ?? r.notes,
            resolvedAt: (status === 'resuelta' || status === 'rechazada') ? new Date().toISOString() : r.resolvedAt,
          }
        : r
    ))
  }

  function handleDownloadPrivacyNotice() {
    window.open(SAMPLE_PRIVACY_NOTICE.downloadUrl, '_blank')
  }

  return (
    <AdminDashboard
      metrics={metrics}
      complianceBadges={SAMPLE_COMPLIANCE_BADGES}
      systemUsers={users}
      auditLogs={SAMPLE_AUDIT_LOGS}
      arcoRequests={arcoRequests}
      fhirExports={fhirExports}
      privacyNotice={SAMPLE_PRIVACY_NOTICE}
      onEditUser={handleEditUser}
      onDeactivateUser={handleDeactivateUser}
      onActivateUser={handleActivateUser}
      onExportFhirIndividual={handleExportFhirIndividual}
      onExportFhirBulk={handleExportFhirBulk}
      onUpdateArcoStatus={handleUpdateArcoStatus}
      onDownloadPrivacyNotice={handleDownloadPrivacyNotice}
    />
  )
}
