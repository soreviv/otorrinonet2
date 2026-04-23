'use client'

import { AppointmentBooking } from '@/components/agenda'
import type { BookingFormData } from '@/lib/agenda-types'

export default function AgendarPage() {
  function handleSubmit(data: BookingFormData) {
    // TODO: POST to /api/appointments, send confirmation email
    console.log('Nueva solicitud de cita:', data)
  }

  return <AppointmentBooking onSubmit={handleSubmit} />
}
