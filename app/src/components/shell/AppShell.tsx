'use client'

import { PatientShell } from './PatientShell'
import { StaffShell, type StaffRole } from './StaffShell'

interface PatientNavItem {
  label: string
  href: string
  isActive?: boolean
}

interface LegalItem {
  label: string
  href: string
}

interface StaffNavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  isActive?: boolean
  roles?: StaffRole[]
}

interface AppShellProps {
  children: React.ReactNode
  variant?: 'patient' | 'staff'
  navigationItems?: PatientNavItem[]
  legalItems?: LegalItem[]
  patientUser?: { name: string; avatarUrl?: string } | null
  staffNavItems?: StaffNavItem[]
  staffUser?: { name: string; role: StaffRole; avatarUrl?: string }
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function AppShell({
  children,
  variant = 'patient',
  navigationItems,
  legalItems,
  patientUser,
  staffNavItems,
  staffUser,
  onNavigate,
  onLogout,
}: AppShellProps) {
  if (variant === 'staff') {
    return (
      <StaffShell
        navigationItems={staffNavItems}
        user={staffUser}
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        {children}
      </StaffShell>
    )
  }

  return (
    <PatientShell
      navigationItems={navigationItems}
      legalItems={legalItems}
      user={patientUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {children}
    </PatientShell>
  )
}
