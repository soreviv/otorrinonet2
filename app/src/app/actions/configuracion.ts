'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { logAction } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export interface FechaBloqueo {
  id: string
  date: string      // 'YYYY-MM-DD'
  tipo: 'feriado' | 'vacaciones' | 'congreso'
  etiqueta: string
}

export interface ClinicConfigData {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicEmail: string
  clinicCofepris: string
  clinicLogoUrl: string
  doctorName: string
  doctorLicense: string
  doctorSpecialtyLicense: string
  doctorUniversity: string
  doctorUniversityLogoUrl: string
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
    clinicEmail: cfg?.clinicEmail ?? '',
    clinicCofepris: cfg?.clinicCofepris ?? '',
    clinicLogoUrl: cfg?.clinicLogoUrl ?? '',
    doctorName: cfg?.doctorName ?? 'Dr. Alejandro Viveros Domínguez',
    doctorLicense: cfg?.doctorLicense ?? '',
    doctorSpecialtyLicense: cfg?.doctorSpecialtyLicense ?? '',
    doctorUniversity: cfg?.doctorUniversity ?? '',
    doctorUniversityLogoUrl: cfg?.doctorUniversityLogoUrl ?? '',
  }
}

const MAX_LOGO_SIZE = 250 * 1024 // 250 KB en data URL

function validateDataUrl(value: string, field: string): void {
  if (!value) return
  if (!value.startsWith('data:image/')) {
    throw new Error(`${field}: formato inválido (debe ser PNG/JPG/WEBP/SVG).`)
  }
  if (value.length > MAX_LOGO_SIZE * 1.4) {
    throw new Error(`${field}: imagen demasiado grande (máx ~250 KB).`)
  }
}

export async function saveClinicConfig(data: ClinicConfigData): Promise<void> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  validateDataUrl(data.clinicLogoUrl, 'Logo del consultorio')
  validateDataUrl(data.doctorUniversityLogoUrl, 'Escudo de la universidad')

  await prisma.clinicConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...data },
    update: data,
  })
  void logAction({ action: 'modificacion', resource: 'clinic_config', userId: session.userId })
}

// ─── Fechas bloqueadas ────────────────────────────────────────────────────────

export async function getDiasFeriados(): Promise<FechaBloqueo[]> {
  await verifySession()
  const cfg = await prisma.clinicConfig.findUnique({
    where: { id: 'singleton' },
    select: { diasFeriados: true },
  })
  if (!cfg?.diasFeriados || !Array.isArray(cfg.diasFeriados)) return []
  return cfg.diasFeriados as unknown as FechaBloqueo[]
}

export async function getPublicBlockedDates(): Promise<string[]> {
  const [cfg, bloqueos] = await Promise.all([
    prisma.clinicConfig.findUnique({
      where: { id: 'singleton' },
      select: { diasFeriados: true },
    }),
    prisma.blockedPeriod.findMany({
      where: {
        endDate: {
          gte: (() => {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            return d
          })(),
        },
      },
    }),
  ])

  const dates = new Set<string>()

  // 1. Días feriados (formato 'YYYY-MM-DD')
  if (cfg?.diasFeriados && Array.isArray(cfg.diasFeriados)) {
    ;(cfg.diasFeriados as unknown as FechaBloqueo[]).forEach((f) => dates.add(f.date))
  }

  // 2. Bloqueos (rangos)
  bloqueos.forEach((b) => {
    const curr = new Date(b.startDate)
    const end = new Date(b.endDate)
    // Asegurar que estamos comparando solo fechas (sin horas que puedan causar problemas de zona horaria)
    curr.setUTCHours(12, 0, 0, 0)
    end.setUTCHours(12, 0, 0, 0)

    while (curr <= end) {
      dates.add(curr.toISOString().split('T')[0])
      curr.setUTCDate(curr.getUTCDate() + 1)
    }
  })

  return Array.from(dates).sort()
}

export async function saveDiasFeriados(fechas: FechaBloqueo[]): Promise<void> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Sin autorización')

  await prisma.clinicConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', diasFeriados: fechas as unknown as never },
    update: { diasFeriados: fechas as unknown as never },
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
