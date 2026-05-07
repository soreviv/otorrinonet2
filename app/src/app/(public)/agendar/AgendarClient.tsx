'use client'

import dynamic from 'next/dynamic'

const AppointmentBooking = dynamic(
  () => import('@/components/agenda').then((m) => ({ default: m.AppointmentBooking })),
  { ssr: false },
)

export default function AgendarClient() {
  return <AppointmentBooking />
}
