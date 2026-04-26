'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { AuditAction } from '@/generated/prisma'

export async function logAction(params: {
  action: AuditAction
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
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? null,
        userId: params.userId ?? null,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: ip,
        userAgent,
      },
    })
  } catch {
    // Never let audit logging break the main flow
  }
}
