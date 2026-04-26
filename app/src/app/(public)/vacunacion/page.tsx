'use client'

import { useRouter } from 'next/navigation'
import { VaccineRecommendationPage } from '@/components/sitio-publico/VaccineRecommendationPage'

export default function VacunacionPageRoute() {
  const router = useRouter()
  return <VaccineRecommendationPage onBookAppointment={() => router.push('/agendar')} />
}
