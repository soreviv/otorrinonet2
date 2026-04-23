'use client'

import { useRouter } from 'next/navigation'
import { DoctorProfilePage } from '@/components/sitio-publico/DoctorProfilePage'
import { doctorProfile } from '@/lib/sitio-publico-data'

export default function PerfilPageRoute() {
  const router = useRouter()

  return (
    <DoctorProfilePage
      doctorProfile={doctorProfile}
      onBookAppointment={() => router.push('/agendar')}
    />
  )
}
