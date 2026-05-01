import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params
  const token = req.nextUrl.searchParams.get('token')
  const base  = req.nextUrl.origin

  if (!token) return NextResponse.redirect(new URL('/?error=token-requerido', base))

  const appointment = await prisma.appointment.findUnique({
    where: { actionToken: token },
  })

  if (!appointment) {
    return NextResponse.redirect(new URL('/?error=enlace-invalido', base))
  }

  if (action === 'confirmar') {
    if (!appointment.patientConfirmed) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { patientConfirmed: true },
      })
    }
    return NextResponse.redirect(new URL('/cita-confirmada', base))
  }

  if (action === 'cancelar') {
    if (appointment.status !== 'cancelada') {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'cancelada' },
      })
    }
    return NextResponse.redirect(new URL('/cita-cancelada', base))
  }

  return NextResponse.redirect(new URL('/', base))
}
