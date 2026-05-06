import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Agendar Cita · Dr. Alejandro Viveros, Otorrinolaringólogo CDMX',
  description: 'Solicita tu cita de forma rápida y sencilla. Selecciona el servicio, fecha y horario disponible.',
  alternates: { canonical: '/agendar' },
}

const AppointmentBooking = dynamic(
  () => import('@/components/agenda').then((m) => ({ default: m.AppointmentBooking })),
  { ssr: false },
)

export default function AgendarPage() {
  return <AppointmentBooking />
}
