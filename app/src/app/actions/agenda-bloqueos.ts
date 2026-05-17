'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getBloqueos() {
  await verifySession()
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return await prisma.blockedPeriod.findMany({
    where: {
      endDate: {
        gte: now,
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  })
}

export async function crearBloqueo(startDate: Date, endDate: Date, reason?: string) {
  const session = await verifySession()
  if (session.role !== 'medico' && session.role !== 'recepcionista') {
    return { ok: false, error: 'No autorizado' }
  }

  if (startDate > endDate) {
    return { ok: false, error: 'La fecha de inicio debe ser anterior o igual a la fecha de fin' }
  }

  try {
    const created = await prisma.blockedPeriod.create({
      data: {
        startDate,
        endDate,
        reason: reason || null,
      },
    })

    void logAction({
      action: 'creacion',
      resource: 'BlockedPeriod',
      resourceId: created.id.toString(),
      details: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: reason || 'N/A'
      },
      userId: session.userId,
    })

    revalidatePath('/staff/agenda/bloqueos')
    revalidatePath('/agendar')
    return { ok: true }
  } catch (error) {
    console.error('Error al crear bloqueo:', error)
    return { ok: false, error: 'Error al crear el bloqueo en la base de datos' }
  }
}

export async function eliminarBloqueo(id: number) {
  const session = await verifySession()
  if (session.role !== 'medico' && session.role !== 'recepcionista') {
    return { ok: false, error: 'No autorizado' }
  }

  try {
    const deleted = await prisma.blockedPeriod.delete({
      where: { id },
    })

    void logAction({
      action: 'eliminacion',
      resource: 'BlockedPeriod',
      resourceId: id.toString(),
      details: {
        startDate: deleted.startDate.toISOString(),
        endDate: deleted.endDate.toISOString(),
        reason: deleted.reason
      },
      userId: session.userId,
    })

    revalidatePath('/staff/agenda/bloqueos')
    revalidatePath('/agendar')
    return { ok: true }
  } catch (error) {
    console.error('Error al eliminar bloqueo:', error)
    return { ok: false, error: 'Error al eliminar el bloqueo' }
  }
}
