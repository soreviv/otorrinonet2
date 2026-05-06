import type { Metadata } from 'next'
import { LocationPage } from '@/components/sitio-publico/LocationPage'
import { contactInfo } from '@/lib/sitio-publico-data'

export const metadata: Metadata = {
  title: 'Ubicación y Horarios · Consultorio Dr. Viveros, Lindavista CDMX',
  description: 'Chosica 730, Colonia Lindavista, Gustavo A. Madero, CDMX. Horarios de lunes a sábado. Cómo llegar y cómo contactarnos.',
  alternates: { canonical: '/ubicacion' },
}

export default function UbicacionPageRoute() {
  return <LocationPage contactInfo={contactInfo} />
}
