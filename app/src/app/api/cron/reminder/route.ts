import { NextRequest, NextResponse } from 'next/server'
import { formatInTimeZone } from 'date-fns-tz'
import { prisma } from '@/lib/prisma'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { sendReminderEmail } from '@/lib/mailer'

const CDMX = 'America/Mexico_City'

// Ejecutar diariamente ~10 AM CDMX.
// Busca citas entre 20h y 28h a partir de ahora para tolerar drift del cron.
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization') ?? ''

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const now = new Date()
  const in20h = new Date(now.getTime() + 20 * 60 * 60 * 1000)
  const in28h = new Date(now.getTime() + 28 * 60 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: in20h, lte: in28h },
      status: { notIn: ['cancelada', 'no_show'] },
      patientEmail: { not: null },
      reminderSent: false,
    },
    select: {
      id: true,
      patientName: true,
      patientEmail: true,
      scheduledAt: true,
      appointmentType: true,
      actionToken: true,
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
      const fecha = formatInTimeZone(appt.scheduledAt, CDMX, 'yyyy-MM-dd')
      const hora  = formatInTimeZone(appt.scheduledAt, CDMX, 'HH:mm')

      await sendReminderEmail(
        {
          patientName:     appt.patientName ?? 'Paciente',
          patientEmail:    appt.patientEmail!,
          fecha,
          hora,
          appointmentType: appt.appointmentType ?? 'primera_vez',
          actionToken:     appt.actionToken ?? '',
        },
        cfg,
      )

      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSent: true },
      })

      sent++
    } catch (e) {
      errors.push(`${appt.id}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return NextResponse.json({ ok: true, sent, errors })
}
