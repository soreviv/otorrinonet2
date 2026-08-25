import type { Metadata } from 'next'
import { AutofacturaClient } from './AutofacturaClient'

export const metadata: Metadata = {
  title: 'Autofacturación | Dr. Viveros ORL',
  description: 'Genera tu comprobante fiscal (CFDI) de tu consulta médica de otorrinolaringología.',
  robots: { index: false },
}

export default function AutofacturaPage() {
  return <AutofacturaClient />
}
