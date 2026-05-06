import type { Metadata } from 'next'
import { ServicesPage } from '@/components/sitio-publico/ServicesPage'
import { services, doctorProfile } from '@/lib/sitio-publico-data'

export const metadata: Metadata = {
  title: 'Servicios · Otorrinolaringología, cirugía y vacunación — Dr. Viveros',
  description: 'Consulta, cirugía endoscópica, rinología, audiología, vértigo y vacunación. Servicios especializados en ORL en Lindavista, CDMX.',
  alternates: { canonical: '/servicios' },
}

export default function ServiciosPageRoute() {
  return (
    <ServicesPage
      services={services}
      doctorProfile={{ fullName: doctorProfile.fullName, title: doctorProfile.title }}
    />
  )
}
