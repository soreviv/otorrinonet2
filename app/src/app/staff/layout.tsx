import { IBM_Plex_Mono } from 'next/font/google'
import { verifySession } from '@/lib/dal'
import { StaffShellWrapper } from '@/components/shell/StaffShellWrapper'

// Carga ambos pesos solo en rutas de staff; en páginas públicas solo se carga el 400.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  return (
    <div className={ibmPlexMono.variable}>
      <StaffShellWrapper userName={session.name} userRole={session.role}>
        {children}
      </StaffShellWrapper>
    </div>
  )
}
