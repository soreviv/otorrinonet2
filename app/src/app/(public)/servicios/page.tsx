'use client'

import { useRouter } from 'next/navigation'
import { ServicesPage } from '@/components/sitio-publico/ServicesPage'
import { services, doctorProfile } from '@/lib/sitio-publico-data'

export default function ServiciosPageRoute() {
  const router = useRouter()

  return (
    <ServicesPage
      services={services}
      doctorProfile={{ fullName: doctorProfile.fullName, title: doctorProfile.title }}
      onBookAppointment={() => router.push('/agendar')}
    />
  )
}
