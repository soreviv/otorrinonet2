'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StepDateTimeSelection } from '@/components/agenda/steps/StepDateTimeSelection'
import { rescheduleAppointmentByToken } from '@/app/actions/appointments'
import { getPublicBlockedDates } from '@/app/actions/configuracion'

interface ModificarCitaFormProps {
  token: string
  patientName: string
  currentDateDisplay: string
  currentTimeDisplay: string
}

export default function ModificarCitaForm({
  token,
  patientName,
  currentDateDisplay,
  currentTimeDisplay,
}: ModificarCitaFormProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    getPublicBlockedDates().then(setBlockedDates).catch(() => {})
  }, [])

  const handleDateChange = useCallback((d: string) => {
    setSelectedDate(d)
    setSelectedTime('')
  }, [])

  const handleTimeChange = useCallback((t: string) => setSelectedTime(t), [])

  async function handleSubmit() {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    setError(null)
    const result = await rescheduleAppointmentByToken(token, selectedDate, selectedTime)
    if (result.ok) {
      router.push('/cita-modificada')
    } else {
      setError(result.error ?? 'Error al modificar la cita. Intente de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-sky-600 px-6 py-5">
          <h1 className="text-white font-bold text-xl">Modificar fecha de cita</h1>
          <p className="text-sky-100 text-sm mt-1">Hola {patientName}, seleccione su nueva fecha y hora</p>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm text-slate-600">
            <p className="font-medium text-slate-700 mb-1">Cita actual</p>
            <p>{currentDateDisplay} a las {currentTimeDisplay}</p>
          </div>

          <p className="text-slate-700 font-medium mb-4">Seleccione la nueva fecha y hora:</p>

          <StepDateTimeSelection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            blockedDates={blockedDates}
          />

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || submitting}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                selectedDate && selectedTime && !submitting
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Guardando…' : 'Confirmar nueva fecha'}
            </button>
            <Link
              href="/"
              className="flex-1 text-center py-2.5 rounded-lg font-medium text-sm text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
