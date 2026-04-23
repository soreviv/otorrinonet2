'use client'

import { useRouter } from 'next/navigation'
import { HomePage } from '@/components/sitio-publico/HomePage'
import {
  doctorProfile,
  services,
  googleReviews,
  googleRatingSummary,
  contactInfo,
} from '@/lib/sitio-publico-data'

export default function HomePageRoute() {
  const router = useRouter()

  return (
    <HomePage
      doctorProfile={doctorProfile}
      services={services}
      googleReviews={googleReviews}
      googleRatingSummary={googleRatingSummary}
      contactInfo={{ phone: contactInfo.phone, whatsapp: contactInfo.whatsapp, email: contactInfo.email }}
      onBookAppointment={() => router.push('/agendar')}
      onViewDoctorProfile={() => router.push('/perfil')}
      onViewAllServices={() => router.push('/servicios')}
    />
  )
}
