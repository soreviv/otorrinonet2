'use client'

import { useRouter } from 'next/navigation'
import { ContactPage } from '@/components/sitio-publico/ContactPage'
import { contactInfo } from '@/lib/sitio-publico-data'

export default function ContactoPageRoute() {
  const router = useRouter()

  return (
    <ContactPage
      contactInfo={contactInfo}
      onSubmitContactForm={(data) => {
        console.log('Contact form submitted:', data)
      }}
      onBookAppointment={() => router.push('/agendar')}
    />
  )
}
