'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import bcrypt from 'bcryptjs'

export interface ClinicConfigData {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicCofepris: string
  doctorName: string
  doctorLicense: string
  doctorSpecialtyLicense: string
  doctorUniversity: string
}

export interface StaffUserData {
  id: string
  email: string
  name: string
  role: string
  status: string
  totpEnabled: boolean
  lastAccess: string | null
  createdAt: string
}

// ─── Clinic Config ────────────────────────────────────────────────────────────

export async function getClinicConfig(): Promise<ClinicConfigData> {
  await verifySession()
  const cfg = await prisma.clinicConfig.findUnique({ where: { id: 'singleton' } })
  return {
    clinicName: cfg?.clinicName ?? 'Clínica ORL Viveros',
    clinicAddress: cfg?.clinicAddress ?? '',
    clinicPhone: cfg?.clinicPhone ?? '',
    clinicCofepris: cfg?.clinicCofepris ?? '',
    doctorName: cfg?.doctorName ?? 'Dr. Alejandro Viveros Domínguez',
    doctorLicense: cfg?.doctorLicense ?? '',
    doctorSpecialtyLicense: cfg?.doctorSpecialtyLicense ?? '',
    doctorUniversity: cfg?.doctorUniversity ?? '',
  }
}

export async function saveClinicConfig(data: ClinicConfigData): Promise<void> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  await prisma.clinicConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...data },
    update: data,
  })
}

// ─── Staff Users ──────────────────────────────────────────────────────────────

export async function getStaffUsers(): Promise<StaffUserData[]> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  const users = await prisma.staffUser.findMany({ orderBy: { createdAt: 'asc' } })
  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    totpEnabled: u.totpEnabled,
    lastAccess: u.lastAccess?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }))
}

export async function createStaffUser(data: {
  email: string
  name: string
  role: string
  password: string
}): Promise<void> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  const passwordHash = await bcrypt.hash(data.password, 12)
  await prisma.staffUser.create({
    data: {
      email: data.email.toLowerCase().trim(),
      name: data.name,
      role: data.role as any,
      passwordHash,
    },
  })
}

export async function toggleStaffUserStatus(userId: string): Promise<void> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')
  if (userId === session.userId) throw new Error('No puedes desactivar tu propia cuenta.')

  const user = await prisma.staffUser.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuario no encontrado')

  await prisma.staffUser.update({
    where: { id: userId },
    data: { status: user.status === 'activo' ? 'inactivo' : 'activo' },
  })
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface AuditLogRecord {
  id: string
  action: string
  resource: string
  resourceId: string | null
  userId: string | null
  userName: string | null
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  timestamp: string
}

export async function getAuditLogs(limit = 200): Promise<AuditLogRecord[]> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: { user: { select: { name: true } } },
  })

  return logs.map(l => ({
    id: l.id,
    action: l.action,
    resource: l.resource,
    resourceId: l.resourceId,
    userId: l.userId,
    userName: l.user?.name ?? null,
    details: l.details,
    ipAddress: l.ipAddress,
    userAgent: l.userAgent,
    timestamp: l.timestamp.toISOString(),
  }))
}
