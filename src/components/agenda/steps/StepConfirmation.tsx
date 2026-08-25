'use client'

import { Check, Calendar, Clock, User, Stethoscope } from 'lucide-react'
import type { BookingFormData } from '@/lib/agenda-types'

function formatDateReadable(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}

interface StepConfirmationProps {
  data: BookingFormData
  onNew: () => void
}

export function StepConfirmation({ data, onNew }: StepConfirmationProps) {
  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center mx-auto mb-5">
        <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center">
          <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
        ¡Solicitud enviada!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        Hemos recibido su solicitud. Le enviaremos un correo a{' '}
        <strong className="text-slate-700 dark:text-slate-300">{data.email}</strong> con los detalles de su cita.
      </p>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-left mb-6 max-w-sm mx-auto space-y-3">
        <SummaryRow
          icon={<Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
          label="Tipo"
          value="Consulta · 30 min"
        />
        <SummaryRow
          icon={<Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />}
          label="Fecha"
          value={<span className="capitalize">{formatDateReadable(data.date)}</span>}
        />
        <SummaryRow
          icon={<Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />}
          label="Hora"
          value={<span className="font-mono">{data.time} hrs</span>}
        />
        <SummaryRow
          icon={<User className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />}
          label="Paciente"
          value={data.patientName}
        />
      </div>

      <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 rounded-xl p-4 max-w-sm mx-auto mb-6">
        <p className="text-xs text-sky-700 dark:text-sky-400 text-center leading-relaxed">
          El correo incluirá botones para <strong>confirmar</strong>, <strong>cancelar</strong> o{' '}
          <strong>reprogramar</strong> su cita. Estará sujeta a disponibilidad.
        </p>
      </div>

      <button
        onClick={onNew}
        className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
      >
        Agendar otra cita
      </button>
    </div>
  )
}
