'use client'

import { useRouter, usePathname } from 'next/navigation'
import { StaffShell, type StaffRole } from './StaffShell'
import { staffNavItems } from './staff-nav-items'
import { logoutAction } from '@/app/actions/auth'

interface ShellWrapperProps {
  children: React.ReactNode
  userName: string
  userRole: StaffRole
}

export function StaffShellWrapper({ children, userName, userRole }: ShellWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = staffNavItems.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.href),
  }))

  return (
    <StaffShell
      navigationItems={navigationItems}
      user={{ name: userName, role: userRole }}
      onNavigate={(href) => router.push(href)}
      onLogout={() => logoutAction()}
    >
      {children}
    </StaffShell>
  )
}
