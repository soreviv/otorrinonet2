'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function logAction(params: {
  action: string
  resource: string
  resourceId?: string | null
  userId?: string | null
  details?: Record<string, unknown> | null
}): Promise<void> {
  try {
    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null
    const userAgent = h.get('user-agent') ?? null

    await prisma.auditLog.create({
      data: {
        accion: params.action,
        entidad: params.resource,
        entidadId: params.resourceId ?? null,
        userId: params.userId ?? null,
        detalles: params.details ? JSON.stringify(params.details) : null,
        ipAddress: ip,
        userAgent,
      },
    })
  } catch {
    // Nunca interrumpir el flujo principal por un error de auditoría
  }
}
