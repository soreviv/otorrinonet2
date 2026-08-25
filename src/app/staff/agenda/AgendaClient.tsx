'use client'

import { useState } from 'react'
import { AppointmentCalendar } from '@/components/agenda'
import { updateAppointmentStatus } from '@/app/actions/agenda'
import type { Appointment, Service } from '@/lib/agenda-types'

interface Props {
  initialAppointments: Appointment[]
  services: Service[]
}

export function AgendaClient({ initialAppointments, services }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)

  async function handleStatus(id: string, status: Appointment['status']) {
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)))
    if (status === 'confirmada' || status === 'cancelada' || status === 'completada') {
      await updateAppointmentStatus(id, status)
    }
  }

  return (
    <AppointmentCalendar
      appointments={appointments}
      services={services}
      onConfirm={id => handleStatus(id, 'confirmada')}
      onReject={id => handleStatus(id, 'cancelada')}
      onCancel={id => handleStatus(id, 'cancelada')}
      onReschedule={id => handleStatus(id, 'reprogramada')}
      onSelect={() => {}}
      onCreate={() => {}}
      onSearch={() => {}}
    />
  )
}
