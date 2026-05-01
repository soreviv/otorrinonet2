'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { logAction } from '@/lib/audit'
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
  status: string              // 'activo' | 'inactivo' (derivado de activo boolean)
  especialidad?: string | null
  cedula?: string | null
  cedulaEspecialidad?: string | null
  universidad?: string | null
  totpEnabled: boolean
  lastAccess: string | null
  createdAt: string
}

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

// ─── Configuración de clínica ─────────────────────────────────────────────────

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
  void logAction({ action: 'modificacion', resource: 'clinic_config', userId: session.userId })
}

// ─── Usuarios del staff ───────────────────────────────────────────────────────

export async function getStaffUsers(): Promise<StaffUserData[]> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  const users = await prisma.staffUser.findMany({ orderBy: { createdAt: 'asc' } })
  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.activo ? 'activo' : 'inactivo',
    especialidad: u.especialidad,
    cedula: u.cedula,
    cedulaEspecialidad: u.cedulaEspecialidad,
    universidad: u.universidad,
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
  especialidad?: string
  cedula?: string
  cedulaEspecialidad?: string
  universidad?: string
}): Promise<void> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  const passwordHash = await bcrypt.hash(data.password, 12)
  await prisma.staffUser.create({
    data: {
      email: data.email.toLowerCase().trim(),
      name: data.name,
      role: data.role,
      passwordHash,
      especialidad: data.especialidad ?? null,
      cedula: data.cedula ?? null,
      cedulaEspecialidad: data.cedulaEspecialidad ?? null,
      universidad: data.universidad ?? null,
    },
  })
  void logAction({ action: 'creacion', resource: 'staff_user', userId: session.userId })
}

export async function updateStaffUser(userId: string, data: {
  name?: string
  especialidad?: string | null
  cedula?: string | null
  cedulaEspecialidad?: string | null
  universidad?: string | null
  logoUniversidadUrl?: string | null
}): Promise<void> {
  const session = await verifySession()
  if (session.role !== 'medico' && session.userId !== userId) throw new Error('Sin autorización')

  await prisma.staffUser.update({ where: { id: userId }, data })
  void logAction({ action: 'modificacion', resource: 'staff_user', resourceId: userId, userId: session.userId })
}

export async function toggleStaffUserStatus(userId: string): Promise<void> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')
  if (userId === session.userId) throw new Error('No puedes desactivar tu propia cuenta.')

  const user = await prisma.staffUser.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuario no encontrado')

  await prisma.staffUser.update({ where: { id: userId }, data: { activo: !user.activo } })
  void logAction({ action: 'modificacion', resource: 'staff_user', resourceId: userId, userId: session.userId })
}

// ─── Auditoría ────────────────────────────────────────────────────────────────

export async function getAuditLogs(limit = 200): Promise<AuditLogRecord[]> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  const logs = await prisma.auditLog.findMany({
    orderBy: { fecha: 'desc' },
    take: limit,
    include: { user: { select: { name: true } } },
  })

  return logs.map(l => ({
    id: l.id,
    action: l.accion,
    resource: l.entidad,
    resourceId: l.entidadId,
    userId: l.userId,
    userName: l.user?.name ?? null,
    details: l.detalles,
    ipAddress: l.ipAddress,
    userAgent: l.userAgent,
    timestamp: l.fecha.toISOString(),
  }))
}
