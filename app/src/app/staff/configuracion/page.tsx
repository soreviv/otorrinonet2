import { verifySession } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { getClinicConfig, getStaffUsers, getAuditLogs } from '@/app/actions/configuracion'
import { ConfiguracionClient } from './ConfiguracionClient'

export default async function ConfiguracionPage() {
  const session = await verifySession()
  if (session.role !== 'medico') redirect('/staff')

  const [clinicConfig, staffUsers, auditLogs] = await Promise.all([
    getClinicConfig(),
    getStaffUsers(),
    getAuditLogs(100),
  ])

  return (
    <ConfiguracionClient
      clinicConfig={clinicConfig}
      staffUsers={staffUsers}
      auditLogs={auditLogs}
      currentUserId={session.userId}
    />
  )
}
