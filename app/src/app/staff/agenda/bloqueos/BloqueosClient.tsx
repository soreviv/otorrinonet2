'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarOff, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react'
import { crearBloqueo, eliminarBloqueo } from '@/app/actions/agenda-bloqueos'
import type { BlockedPeriod } from '@/generated/prisma'

interface Props {
  bloqueosIniciales: BlockedPeriod[]
}

export function BloqueosClient({ bloqueosIniciales }: Props) {
  const router = useRouter()
  const [bloqueos, setBloqueos] = useState(bloqueosIniciales)

  // Sincronizar estado local cuando cambian los props desde el servidor
  if (bloqueosIniciales !== bloqueos && bloqueosIniciales.length !== bloqueos.length) {
    setBloqueos(bloqueosIniciales)
  }
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate || !endDate) return

    setError(null)
    startTransition(async () => {
      const result = await crearBloqueo(new Date(startDate), new Date(endDate), reason)
      if (result.ok) {
        setStartDate('')
        setEndDate('')
        setReason('')
        router.refresh()
        // Actualizar estado local para feedback inmediato si es necesario,
        // aunque router.refresh() actualizará los props del server component.
      } else {
        setError(result.error || 'Error al crear el bloqueo')
      }
    })
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Está seguro de eliminar este bloqueo?')) return

    setError(null)
    startTransition(async () => {
      const result = await eliminarBloqueo(id)
      if (result.ok) {
        setBloqueos(prev => prev.filter(b => b.id !== id))
        router.refresh()
      } else {
        setError(result.error || 'Error al eliminar el bloqueo')
      }
    })
  }

  const formatFecha = (d: Date) => {
    return new Date(d).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }

  return (
    <div className="space-y-6">
      {/* Formulario Inline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <CalendarOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nuevo Bloqueo de Agenda</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Las fechas seleccionadas no estarán disponibles para agendado público.</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label htmlFor="startDate" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fecha Inicio
            </label>
            <input
              id="startDate"
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="endDate" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fecha Fin
            </label>
            <input
              id="endDate"
              type="date"
              required
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="reason" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Motivo (opcional)
            </label>
            <input
              id="reason"
              type="text"
              placeholder="Vacaciones, Congreso..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !startDate || !endDate}
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Agregar Bloqueo
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Tabla de Bloqueos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Bloqueos Activos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inicio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fin</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Motivo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bloqueos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No hay bloqueos activos programados.
                  </td>
                </tr>
              ) : (
                bloqueos.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {formatFecha(b.startDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {formatFecha(b.endDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {b.reason || <span className="italic text-slate-400">Sin motivo especificado</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(b.id)}
                        disabled={isPending}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Eliminar bloqueo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
