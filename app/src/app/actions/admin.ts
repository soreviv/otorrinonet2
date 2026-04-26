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
    status: u.status as UserStatus,
    lastAccess: (u.lastAccess ?? u.createdAt).toISOString(),
    createdAt: u.createdAt.toISOString(),
  }))
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { timestamp: 'desc' },
    take: 100,
  })
  return logs.map(l => ({
    id: l.id,
    action: l.action.replace('_', '-') as AuditLog['action'],
    resource: l.resource,
    userId: l.userId,
    userName: l.user?.name ?? 'Sistema',
    ipAddress: l.ipAddress,
    timestamp: l.timestamp.toISOString(),
  }))
}

export async function getArcoRequests(): Promise<ArcoRequest[]> {
  const requests = await prisma.arcoRequest.findMany({
    include: { patient: true },
    orderBy: { submittedAt: 'desc' },
  })
  return requests.map(r => ({
    id: r.id,
    type: r.type as ArcoRequest['type'],
    patientName: `${r.patient.firstName} ${r.patient.lastName}`,
    patientId: r.patientId,
    description: r.description,
    status: r.status.replace('_', '-') as ArcoStatus,
    submittedAt: r.submittedAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    notes: r.notes ?? null,
  }))
}

export async function getFhirExports(): Promise<FhirExport[]> {
  const exports = await prisma.fhirExport.findMany({
    include: { patient: true, requestedBy: true },
    orderBy: { requestedAt: 'desc' },
  })
  return exports.map(e => ({
    id: e.id,
    type: e.type as FhirExport['type'],
    patientName: e.patient ? `${e.patient.firstName} ${e.patient.lastName}` : null,
    patientId: e.patientId ?? null,
    dateRangeFrom: e.dateRangeFrom?.toISOString(),
    dateRangeTo: e.dateRangeTo?.toISOString(),
    requestedBy: e.requestedBy.name,
    status: e.status.replace('_', '-') as FhirExport['status'],
    fileSize: e.fileSize ?? null,
    requestedAt: e.requestedAt.toISOString(),
    completedAt: e.completedAt?.toISOString() ?? null,
  }))
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.staffUser.update({ where: { id: userId }, data: { role: role as any } })
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.staffUser.update({ where: { id: userId }, data: { status: status as any } })
}

export async function updateArcoRequestStatus(
  requestId: string,
  status: ArcoStatus,
  notes?: string,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbStatus = status.replace('-', '_') as any
  await prisma.arcoRequest.update({
    where: { id: requestId },
    data: {
      status: dbStatus,
      notes: notes ?? undefined,
      resolvedAt: status === 'resuelta' || status === 'rechazada' ? new Date() : undefined,
    },
  })
}
