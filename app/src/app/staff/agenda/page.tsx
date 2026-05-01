import { getAppointments, getServices } from '@/app/actions/agenda'
import { AgendaClient } from './AgendaClient'

export default async function AgendaPage() {
  const [appointments, services] = await Promise.all([getAppointments(), getServices()])

  return <AgendaClient initialAppointments={appointments} services={services} />
}
