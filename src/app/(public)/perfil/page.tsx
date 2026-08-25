import type { Metadata } from 'next'
import { DoctorProfilePage } from '@/components/sitio-publico/DoctorProfilePage'
import { doctorProfile } from '@/lib/sitio-publico-data'

export const metadata: Metadata = {
  title: 'Perfil · Dr. Alejandro Viveros Domínguez, Otorrinolaringólogo',
  description: 'Formación, especialidades y trayectoria del Dr. Alejandro Viveros Domínguez, otorrinolaringólogo certificado en CDMX.',
  alternates: { canonical: '/perfil' },
}

export default function PerfilPageRoute() {
  return <DoctorProfilePage doctorProfile={doctorProfile} />
}
