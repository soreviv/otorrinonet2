'use client'

import dynamic from 'next/dynamic'
import type { DashboardMetrics } from '@/app/actions/dashboard'

const ChartPlaceholder = () => <div className="h-[220px] bg-slate-50 animate-pulse rounded-xl" />

const CitasPorDiaChart = dynamic<{ data: DashboardMetrics['citasPorDia'] }>(
  () => import('./DashboardCharts').then(m => m.CitasPorDiaChart),
  { ssr: false, loading: ChartPlaceholder },
)
const CitasPorEstadoChart = dynamic<{ data: DashboardMetrics['citasPorEstado'] }>(
  () => import('./DashboardCharts').then(m => m.CitasPorEstadoChart),
  { ssr: false, loading: ChartPlaceholder },
)

export { CitasPorDiaChart, CitasPorEstadoChart }
