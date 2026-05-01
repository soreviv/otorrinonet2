import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { getSystemUsers, getAuditLogs, getArcoRequests, getFhirExports } from '@/app/actions/admin'
import { SAMPLE_COMPLIANCE_BADGES, SAMPLE_METRICS, SAMPLE_PRIVACY_NOTICE } from '@/lib/admin-data'
import { AdminClient } from './AdminClient'

export default async function AdminPage() {
  const session = await verifySession()
  if (session.role !== 'medico') redirect('/staff/agenda')

  const [users, auditLogs, arcoRequests, fhirExports] = await Promise.all([
    getSystemUsers(),
    getAuditLogs(),
    getArcoRequests(),
    getFhirExports(),
  ])

  const now = new Date()
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const fhirThisMonth = fhirExports.filter(e => {
    const d = new Date(e.requestedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const accessesLast24h = auditLogs.filter(l => new Date(l.timestamp) > since24h).length

  const metrics = {
    ...SAMPLE_METRICS,
    activeUsers: users.filter(u => u.status === 'activo').length,
    pendingArcoRequests: arcoRequests.filter(r => r.status === 'pendiente').length,
    fhirExportsThisMonth: fhirThisMonth,
    accessesLast24h,
  }

  return (
    <AdminClient
      metrics={metrics}
      complianceBadges={SAMPLE_COMPLIANCE_BADGES}
      systemUsers={users}
      auditLogs={auditLogs}
      arcoRequests={arcoRequests}
      fhirExports={fhirExports}
      privacyNotice={SAMPLE_PRIVACY_NOTICE}
    />
  )
}
