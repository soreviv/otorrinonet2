import { StaffShellWrapper } from '@/components/shell/StaffShellWrapper'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <StaffShellWrapper>{children}</StaffShellWrapper>
}
