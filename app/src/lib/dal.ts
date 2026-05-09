import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'
import { getSession } from './session'
import type { SessionPayload } from './session'

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const user = await prisma.staffUser.findUnique({
    where: { id: session.userId },
    select: { sessionVersion: true, activo: true },
  })

  if (!user || !user.activo || user.sessionVersion !== session.sessionVersion) {
    redirect('/login')
  }

  return session
})

export const requireMedico = cache(async (): Promise<SessionPayload> => {
  const session = await verifySession()
  if (session.role !== 'medico') redirect('/staff/agenda')
  return session
})
