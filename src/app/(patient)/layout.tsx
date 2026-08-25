import { PatientShellWrapper } from '@/components/shell/PatientShellWrapper'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <PatientShellWrapper>{children}</PatientShellWrapper>
}
