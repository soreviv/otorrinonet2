'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

// Lu–Mi: 16:00–19:30 · Ju–Vi: 10:00–12:30
const TIMES_AFTERNOON = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30']
const TIMES_MORNING = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30']
const CONSULTATION_DAYS = new Set([1, 2, 3, 4, 5]) // Lu Ma Mi Ju Vi

function getTimesForDate(isoDate: string): string[] {
  const dow = new Date(isoDate + 'T00:00:00').getDay()
  if (dow === 1 || dow === 2 || dow === 3) return TIMES_AFTERNOON
  if (dow === 4 || dow === 5) return TIMES_MORNING
  return []
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

interface StepDateTimeSelectionProps {
  selectedDate: string
  selectedTime: string
  onDateChange: (d: string) => void
  onTimeChange: (t: string) => void
}

export function StepDateTimeSelection({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: StepDateTimeSelectionProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const cells = useMemo<(number | null)[]>(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startOffset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const result: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [viewYear, viewMonth])

  const availableTimes = useMemo(
    () => (selectedDate ? getTimesForDate(selectedDate) : []),
    [selectedDate],
  )

  function toISO(day: number) {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${viewYear}-${mm}-${dd}`
  }

  function isDisabled(day: number) {
    const date = new Date(viewYear, viewMonth, day)
    return date < today || !CONSULTATION_DAYS.has(date.getDay())
  }

  const todayISO = today.toISOString().split('T')[0]

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">
        Seleccione fecha y hora
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Escoja el día y el horario de su preferencia.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              aria-label="Mes anterior"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              aria-label="Mes siguiente"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1" role="row">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5" role="grid" aria-label="Calendario">
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} role="gridcell" />
              const iso = toISO(day)
              const disabled = isDisabled(day)
              const isSelected = iso === selectedDate
              const isToday = iso === todayISO
              return (
                <button
                  key={iso}
                  role="gridcell"
                  disabled={disabled}
                  onClick={() => onDateChange(iso)}
                  aria-label={`${day} de ${MONTH_NAMES[viewMonth]}`}
                  aria-selected={isSelected}
                  aria-disabled={disabled}
                  className={`h-9 w-full rounded-lg text-sm transition-all font-medium ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-sm'
                      : disabled
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : isToday
                      ? 'text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 dark:hover:bg-sky-950/30 ring-1 ring-sky-300 dark:ring-sky-700'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600 text-center mt-3">
            Lu–Mi 4–8 pm · Ju–Vi 10 am–1 pm · Sáb y Dom sin consulta
          </p>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Horarios disponibles
          </p>
          {selectedDate ? (
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Horarios">
              {availableTimes.map((t) => (
                <button
                  key={t}
                  onClick={() => onTimeChange(t)}
                  aria-pressed={t === selectedTime}
                  className={`py-2 px-2 rounded-xl text-sm font-mono font-medium transition-all ${
                    t === selectedTime
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:text-sky-700 dark:hover:text-sky-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="text-center space-y-1">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                <p className="text-sm text-slate-400 dark:text-slate-600">
                  Seleccione un día primero
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
