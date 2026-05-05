import { Suspense } from 'react'
import Link from 'next/link'
import {
  Users, Calendar, FileText, AlertCircle, Pill,
  Clock, Activity, TrendingUp, ChevronRight,
} from 'lucide-react'
import { getDashboardMetrics, getCitasHoy, getPacientesRecientes } from '@/app/actions/dashboard'
import { CitasPorDiaChart, CitasPorEstadoChart } from '@/components/dashboard/DashboardChartsClient'

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada',
}
const STATUS_COLORS: Record<string, string> = {
  pendiente:  'bg-amber-100 text-amber-800',
  confirmada: 'bg-sky-100 text-sky-800',
  completada: 'bg-green-100 text-green-800',
  cancelada:  'bg-red-100 text-red-800',
}

export default async function StaffDashboard() {
  const [metrics, citasHoy, pacientesRecientes] = await Promise.all([
    getDashboardMetrics(),
    getCitasHoy(),
    getPacientesRecientes(),
  ])

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const stats = [
    { label: 'Pacientes',       value: metrics.totalPacientes,      icon: Users,       color: 'text-sky-600',   bg: 'bg-sky-50' },
    { label: 'Citas hoy',       value: metrics.citasHoy,            icon: Calendar,    color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Citas pendientes',value: metrics.citasPendientes,      icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Notas hoy',       value: metrics.notasMedicasHoy,     icon: FileText,    color: 'text-emerald-600',bg: 'bg-emerald-50' },
    { label: 'Recetas activas', value: metrics.prescripcionesActivas,icon: Pill,        color: 'text-rose-600',  bg: 'bg-rose-50' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="h-3.5 w-3.5" />
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
          <Activity className="h-3 w-3" />
          Sistema activo
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-sky-600" />
            Citas — últimos 7 días
          </h2>
          <Suspense fallback={<div className="h-[220px] bg-slate-50 animate-pulse rounded-xl" />}>
            <CitasPorDiaChart data={metrics.citasPorDia} />
          </Suspense>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Estado de citas</h2>
          <Suspense fallback={<div className="h-[220px] bg-slate-50 animate-pulse rounded-xl" />}>
            <CitasPorEstadoChart data={metrics.citasPorEstado} />
          </Suspense>
        </div>
      </div>

      {/* Citas de hoy + Pacientes recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Citas de hoy</h2>
            <Link href="/staff/agenda" className="text-xs text-sky-600 hover:underline flex items-center gap-0.5">
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {citasHoy.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No hay citas programadas para hoy</p>
          ) : (
            <div className="space-y-2">
              {citasHoy.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-mono font-semibold text-sky-700 shrink-0">{apt.time}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{apt.patientName}</p>
                      {apt.reason && <p className="text-xs text-slate-500 truncate">{apt.reason}</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${STATUS_COLORS[apt.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_LABELS[apt.status] ?? apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Pacientes recientes</h2>
            <Link href="/staff/ehr" className="text-xs text-sky-600 hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {pacientesRecientes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No hay pacientes registrados</p>
          ) : (
            <div className="space-y-2">
              {pacientesRecientes.map(p => (
                <Link key={p.id} href={`/staff/ehr?id=${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-sm font-bold shrink-0">
                    {p.nombre.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {p.nombre} {p.apellidoPaterno}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
