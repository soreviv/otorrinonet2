import type { Metadata } from 'next'
import { ContactPage } from '@/components/sitio-publico/ContactPage'
import { contactInfo } from '@/lib/sitio-publico-data'

export const metadata: Metadata = {
  title: 'Contacto · Consultorio Dr. Alejandro Viveros Domínguez',
  description: 'Escríbenos o llama al consultorio del Dr. Viveros Domínguez en Lindavista, CDMX. Respuesta en menos de 24 horas.',
  alternates: { canonical: '/contacto' },
}

export default function ContactoPageRoute() {
  return <ContactPage contactInfo={contactInfo} />
}
