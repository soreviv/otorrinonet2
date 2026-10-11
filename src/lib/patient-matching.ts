import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/crypto'

export interface MatchedPatient {
  patient: {
    id: string
    expedienteNumber: string
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string | null
    email: string | null
    telefono: string | null
    status: string
  }
  matchedBy: 'email' | 'phone' | 'both'
}

/**
 * Normaliza un correo electrónico para comparación:
 * minúsculas, sin espacios al inicio ni al final.
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const clean = email.trim().toLowerCase()
  return clean.length > 0 ? clean : null
}

/**
 * Normaliza un número telefónico para comparación:
 * Extrae solo dígitos. En México los números telefónicos constan de 10 dígitos.
 * Si se incluye código de país (+52), extrae los últimos 10 dígitos.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    return digits.slice(-10)
  }
  if (digits.length >= 7) {
    return digits
  }
  return null
}

export function emailsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const normA = normalizeEmail(a)
  const normB = normalizeEmail(b)
  if (!normA || !normB) return false
  return normA === normB
}

export function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const normA = normalizePhone(a)
  const normB = normalizePhone(b)
  if (!normA || !normB) return false
  if (normA.length >= 10 && normB.length >= 10) {
    return normA.slice(-10) === normB.slice(-10)
  }
  return normA === normB
}

/**
 * Busca si ya existe un paciente activo registrado con el mismo correo electrónico o teléfono celular.
 * Los datos se comparan descifrándolos en memoria para soportar cifrado AES-256-GCM y datos legados.
 */
export async function findExistingPatient({
  email,
  phone,
  excludePatientId,
}: {
  email?: string | null
  phone?: string | null
  excludePatientId?: string
}): Promise<MatchedPatient | null> {
  const targetEmail = normalizeEmail(email)
  const targetPhone = normalizePhone(phone)

  if (!targetEmail && !targetPhone) {
    return null
  }

  const candidates = await prisma.patient.findMany({
    where: {
      status: 'activo',
      ...(targetEmail && !targetPhone ? { email: { not: null } } : {}),
      ...(!targetEmail && targetPhone ? { telefono: { not: null } } : {}),
      ...(targetEmail && targetPhone ? { OR: [{ email: { not: null } }, { telefono: { not: null } }] } : {}),
      ...(excludePatientId ? { id: { not: excludePatientId } } : {}),
    },
    select: {
      id: true,
      expedienteNumber: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      email: true,
      telefono: true,
      status: true,
    },
  })

  let emailMatch: MatchedPatient | null = null
  let phoneMatch: MatchedPatient | null = null

  for (const candidate of candidates) {
    const pEmail = candidate.email ? decrypt(candidate.email) : null
    const pPhone = candidate.telefono ? decrypt(candidate.telefono) : null

    const hasEmailMatch = emailsMatch(pEmail, targetEmail)
    const hasPhoneMatch = phonesMatch(pPhone, targetPhone)

    if (hasEmailMatch && hasPhoneMatch) {
      return { patient: candidate, matchedBy: 'both' }
    }
    if (hasEmailMatch && !emailMatch) {
      emailMatch = { patient: candidate, matchedBy: 'email' }
    }
    if (hasPhoneMatch && !phoneMatch) {
      phoneMatch = { patient: candidate, matchedBy: 'phone' }
    }
  }

  return emailMatch ?? phoneMatch ?? null
}
