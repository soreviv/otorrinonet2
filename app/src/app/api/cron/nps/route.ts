import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { sendNpsEmail } from '@/lib/mailer'
import { contactInfo } from '@/lib/sitio-publico-data'

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization') ?? ''

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const now = new Date()
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: fortyEightHoursAgo, lte: twoHoursAgo },
      status: { notIn: ['cancelada', 'no_show'] },
      patientEmail: { not: null },
      npsSentAt: null,
    },
    select: {
      id: true,
      patientName: true,
      patientEmail: true,
      scheduledAt: true,
    },
  })

  if (appointments.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const cfg = await getClinicConfigFromDB()
  let sent = 0
  const errors: string[] = []

  for (const appt of appointments) {
    try {
      await sendNpsEmail(
        {
          patientName: appt.patientName ?? 'Paciente',
          patientEmail: appt.patientEmail!,
          whatsapp: contactInfo.whatsapp,
        },
        cfg,
      )
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { npsSentAt: new Date() },
      })
      sent++
    } catch (e) {
      errors.push(`${appt.id}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return NextResponse.json({ ok: true, sent, errors })
}
