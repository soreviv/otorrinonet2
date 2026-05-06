'use client'

import dynamic from 'next/dynamic'
import type { DashboardMetrics } from '@/app/actions/dashboard'

const CitasPorDiaChart = dynamic<{ data: DashboardMetrics['citasPorDia'] }>(
  () => import('./DashboardCharts').then(m => m.CitasPorDiaChart),
  { ssr: false }
)
const CitasPorEstadoChart = dynamic<{ data: DashboardMetrics['citasPorEstado'] }>(
  () => import('./DashboardCharts').then(m => m.CitasPorEstadoChart),
  { ssr: false }
)

export { CitasPorDiaChart, CitasPorEstadoChart }
