import { verifySession } from '@/lib/dal'
import { StaffShellWrapper } from '@/components/shell/StaffShellWrapper'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  return (
    <StaffShellWrapper userName={session.name} userRole={session.role}>
      {children}
    </StaffShellWrapper>
  )
}
