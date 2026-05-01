'use server'

import { prisma } from '@/lib/prisma'
import type { SystemUser, AuditLog, ArcoRequest, FhirExport, UserRole, UserStatus, ArcoStatus } from '@/lib/admin-types'

export async function getSystemUsers(): Promise<SystemUser[]> {
  const users = await prisma.staffUser.findMany({ orderBy: { createdAt: 'asc' } })
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    status: (u.activo ? 'activo' : 'inactivo') as UserStatus,
    lastAccess: (u.lastAccess ?? u.createdAt).toISOString(),
    createdAt: u.createdAt.toISOString(),
  }))
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { fecha: 'desc' },
    take: 100,
  })
  return logs.map(l => ({
    id: l.id,
    action: l.accion as AuditLog['action'],
    resource: l.entidad,
    userId: l.userId,
    userName: l.user?.name ?? 'Sistema',
    ipAddress: l.ipAddress,
    timestamp: l.fecha.toISOString(),
  }))
}

export async function getArcoRequests(): Promise<ArcoRequest[]> {
  const requests = await prisma.arcoRequest.findMany({
    include: { patient: true },
    orderBy: { submittedAt: 'desc' },
  })
  return requests.map(r => {
    const p = r.patient
    const patientName = [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ')
    return {
      id: r.id,
      type: r.type as ArcoRequest['type'],
      patientName,
      patientId: r.patientId,
      description: r.description,
      status: r.status.replace('_', '-') as ArcoStatus,
      submittedAt: r.submittedAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
      notes: r.notes ?? null,
    }
  })
}

export async function getFhirExports(): Promise<FhirExport[]> {
  const exports = await prisma.fhirExport.findMany({
    include: { patient: true, requestedBy: true },
    orderBy: { requestedAt: 'desc' },
  })
  return exports.map(e => {
    const p = e.patient
    const patientName = p ? [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ') : null
    return {
      id: e.id,
      type: e.type as FhirExport['type'],
      patientName,
      patientId: e.patientId ?? null,
      dateRangeFrom: e.dateRangeFrom?.toISOString(),
      dateRangeTo: e.dateRangeTo?.toISOString(),
      requestedBy: e.requestedBy.name,
      status: e.status.replace('_', '-') as FhirExport['status'],
      fileSize: e.fileSize ?? null,
      requestedAt: e.requestedAt.toISOString(),
      completedAt: e.completedAt?.toISOString() ?? null,
    }
  })
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await prisma.staffUser.update({ where: { id: userId }, data: { role } })
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  await prisma.staffUser.update({ where: { id: userId }, data: { activo: status === 'activo' } })
}

export async function updateArcoRequestStatus(
  requestId: string,
  status: ArcoStatus,
  notes?: string,
): Promise<void> {
  const dbStatus = status.replace('-', '_')
  await prisma.arcoRequest.update({
    where: { id: requestId },
    data: {
      status: dbStatus,
      notes: notes ?? undefined,
      resolvedAt: status === 'resuelta' || status === 'rechazada' ? new Date() : undefined,
    },
  })
}
