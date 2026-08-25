import type { Metadata } from 'next'
import { VaccineRecommendationPage } from '@/components/sitio-publico/VaccineRecommendationPage'

export const metadata: Metadata = {
  title: 'Guía de Vacunación · Dr. Viveros, Otorrinolaringólogo CDMX',
  description: 'Consulta las vacunas recomendadas según tu edad, sexo y condición de salud. Basadas en la Cartilla Nacional de Vacunación (SSA) y el CDC.',
  alternates: { canonical: '/vacunacion' },
}

export default function VacunacionPageRoute() {
  return <VaccineRecommendationPage />
}
