import { getPatients } from '@/app/actions/ehr'
import { verifySession } from '@/lib/dal'
import { EhrClient } from './EhrClient'
import type { UserRole } from '@/lib/ehr-types'

export default async function EhrPage() {
  const [session, patients] = await Promise.all([verifySession(), getPatients()])

  return (
    <EhrClient
      initialPatients={patients}
      currentUserRole={session.role as UserRole}
    />
  )
}
