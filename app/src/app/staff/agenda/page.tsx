'use client'

import { useState } from 'react'
import { AppointmentCalendar } from '@/components/agenda'
import { SAMPLE_APPOINTMENTS, SERVICES } from '@/lib/agenda-data'
import type { Appointment } from '@/lib/agenda-types'

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS)

  function updateStatus(id: string, status: Appointment['status']) {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    )
  }

  return (
    <AppointmentCalendar
      appointments={appointments}
      services={SERVICES}
      onConfirm={(id) => updateStatus(id, 'confirmada')}
      onReject={(id) => updateStatus(id, 'cancelada')}
      onCancel={(id) => updateStatus(id, 'cancelada')}
      onReschedule={(id) => updateStatus(id, 'reprogramada')}
      onSelect={(id) => console.log('selected:', id)}
      onCreate={() => console.log('create new appointment')}
      onSearch={(q) => console.log('search:', q)}
    />
  )
}
