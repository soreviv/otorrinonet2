import type { Metadata } from 'next'
import { HomePage } from '@/components/sitio-publico/HomePage'
import {
  doctorProfile,
  services,
  googleReviews,
  googleRatingSummary,
  contactInfo,
} from '@/lib/sitio-publico-data'

export const metadata: Metadata = {
  title: 'Dr. Alejandro Viveros Domínguez · Otorrinolaringólogo CDMX',
  description: 'Especialista en otorrinolaringología, cirugía de cabeza y cuello en Lindavista, CDMX. Agenda tu cita en línea.',
  alternates: { canonical: '/' },
}

export default function HomePageRoute() {
  return (
    <HomePage
      doctorProfile={doctorProfile}
      services={services}
      googleReviews={googleReviews}
      googleRatingSummary={googleRatingSummary}
      contactInfo={{ phone: contactInfo.phone, whatsapp: contactInfo.whatsapp, email: contactInfo.email }}
    />
  )
}
