import type { Metadata } from 'next'
import { HomePage } from '@/components/sitio-publico/HomePage'
import { doctorProfile, services, contactInfo } from '@/lib/sitio-publico-data'
import { getCachedGoogleReviews } from '@/lib/google-places'

export const metadata: Metadata = {
  title: 'Dr. Alejandro Viveros Domínguez · Otorrinolaringólogo CDMX',
  description: 'Especialista en otorrinolaringología, cirugía de cabeza y cuello en Lindavista, CDMX. Agenda tu cita en línea.',
  alternates: { canonical: '/' },
}

export default async function HomePageRoute() {
  const { reviews, summary } = await getCachedGoogleReviews()

  return (
    <HomePage
      doctorProfile={doctorProfile}
      services={services}
      googleReviews={reviews}
      googleRatingSummary={summary}
      contactInfo={{ phone: contactInfo.phone, whatsapp: contactInfo.whatsapp, email: contactInfo.email }}
    />
  )
}
