'use client'

import { useRouter } from 'next/navigation'
import { LocationPage } from '@/components/sitio-publico/LocationPage'
import { contactInfo } from '@/lib/sitio-publico-data'

export default function UbicacionPageRoute() {
  const router = useRouter()

  return (
    <LocationPage
      contactInfo={contactInfo}
      onBookAppointment={() => router.push('/agendar')}
    />
  )
}
