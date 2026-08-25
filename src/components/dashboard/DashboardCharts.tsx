'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import type { DashboardMetrics } from '@/app/actions/dashboard'

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada',
}
const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd']

export function CitasPorDiaChart({ data }: { data: DashboardMetrics['citasPorDia'] }) {
  const formatted = data.map(d => ({
    fecha: new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
    citas: d.total,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="citas" fill="#0284c7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CitasPorEstadoChart({ data }: { data: DashboardMetrics['citasPorEstado'] }) {
  const formatted = data.map(d => ({
    name: STATUS_LABELS[d.estado] ?? d.estado,
    value: d.total,
  }))

  if (formatted.length === 0) return (
    <div className="flex items-center justify-center h-[220px] text-sm text-slate-400">Sin datos de citas</div>
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={formatted} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
          paddingAngle={2} dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
