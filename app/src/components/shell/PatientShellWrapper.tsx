'use client'

import { useRouter, usePathname } from 'next/navigation'
import { PatientShell } from './PatientShell'

const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios' },
]

const legalItems = [
  { label: 'Aviso de privacidad', href: '/legal/privacidad' },
  { label: 'Términos y condiciones', href: '/legal/terminos' },
  { label: 'Política de cookies', href: '/legal/cookies' },
]

export function PatientShellWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = navItems.map((item) => ({
    ...item,
    isActive: pathname === item.href,
  }))

  return (
    <PatientShell
      navigationItems={navigationItems}
      legalItems={legalItems}
      user={null}
      onNavigate={(href) => router.push(href)}
      onLogout={() => router.push('/login')}
    >
      {children}
    </PatientShell>
  )
}
