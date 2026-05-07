import type { Metadata } from 'next'
import AgendarClient from './AgendarClient'

export const metadata: Metadata = {
  title: 'Agendar Cita · Dr. Alejandro Viveros, Otorrinolaringólogo CDMX',
  description: 'Solicita tu cita de forma rápida y sencilla. Selecciona el servicio, fecha y horario disponible.',
  alternates: { canonical: '/agendar' },
}

export default function AgendarPage() {
  return <AgendarClient />
}
