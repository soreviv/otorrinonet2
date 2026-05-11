'use client'

import { useState, useTransition } from 'react'
import { DollarSign, Check, Pencil } from 'lucide-react'
import { registrarCobro, TIPOS_CONSULTA, type TipoConsulta, type MetodoPago } from '@/app/actions/cobros'
import type { CobroResumen } from '@/lib/agenda-types'

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'tarjeta',       label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
]

const TIPO_LABELS: Record<string, string> = {
  primera_vez:  'Primera vez',
  subsecuente:  'Subsecuente',
  lavado_oidos: 'Lavado de oídos',
  otro:         'Otro',
}

const METODO_LABELS: Record<string, string> = {
  efectivo:      'Efectivo',
  tarjeta:       'Tarjeta',
  transferencia: 'Transferencia',
}

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(centavos / 100)
}

interface Props {
  appointmentId: string
  cobro: CobroResumen | null | undefined
  onCobrado: (cobro: CobroResumen) => void
}

export function CobroPanel({ appointmentId, cobro: cobroInicial, onCobrado }: Props) {
  const [editando, setEditando] = useState(!cobroInicial)
  const [tipo, setTipo] = useState<TipoConsulta>(
    (cobroInicial?.tipoConsulta as TipoConsulta) ?? 'primera_vez'
  )
  const [monto, setMonto] = useState(
    cobroInicial ? String(cobroInicial.montoTotal / 100) : String(TIPOS_CONSULTA[0].monto / 100)
  )
  const [metodo, setMetodo] = useState<MetodoPago>(
    (cobroInicial?.metodoPago as MetodoPago) ?? 'efectivo'
  )
  const [notas, setNotas] = useState(cobroInicial?.notasExtra ?? '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleTipoChange(val: TipoConsulta) {
    setTipo(val)
    const preset = TIPOS_CONSULTA.find(t => t.value === val)
    if (preset && preset.monto > 0) setMonto(String(preset.monto / 100))
  }

  function handleGuardar() {
    const montoNum = Math.round(parseFloat(monto) * 100)
    if (isNaN(montoNum) || montoNum <= 0) { setError('Ingresa un monto válido'); return }
    setError('')
    startTransition(async () => {
      const res = await registrarCobro(appointmentId, {
        tipoConsulta: tipo,
        montoTotal: montoNum,
        notasExtra: notas,
        metodoPago: metodo,
      })
      if (res.ok) {
        onCobrado({
          id: '',
          tipoConsulta: tipo,
          montoTotal: montoNum,
          metodoPago: metodo,
          notasExtra: notas || null,
          facturado: false,
          cobradoAt: new Date().toISOString(),
        })
        setEditando(false)
      } else {
        setError(res.error ?? 'Error al guardar')
      }
    })
  }

  if (!editando && cobroInicial) {
    return (
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Cobro registrado</span>
            {cobroInicial.facturado && (
              <span className="text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-medium">Facturado</span>
            )}
          </div>
          {!cobroInicial.facturado && (
            <button onClick={() => setEditando(true)} className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline">
              <Pencil className="w-3 h-3" /> Editar
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Tipo</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{TIPO_LABELS[cobroInicial.tipoConsulta] ?? cobroInicial.tipoConsulta}</span>
          <span className="text-slate-500 dark:text-slate-400">Total</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{formatMXN(cobroInicial.montoTotal)}</span>
          <span className="text-slate-500 dark:text-slate-400">Método</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{METODO_LABELS[cobroInicial.metodoPago] ?? cobroInicial.metodoPago}</span>
          {cobroInicial.notasExtra && (
            <>
              <span className="text-slate-500 dark:text-slate-400">Notas</span>
              <span className="text-slate-700 dark:text-slate-300">{cobroInicial.notasExtra}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
        </div>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Registrar cobro</span>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Tipo de consulta</span>
          <select
            value={tipo}
            onChange={e => handleTipoChange(e.target.value as TipoConsulta)}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {TIPOS_CONSULTA.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Monto total (MXN)</span>
          <div className="mt-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number" min="0" step="0.01" value={monto}
              onChange={e => setMonto(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Método de pago</span>
          <div className="mt-1 flex gap-2">
            {METODOS.map(m => (
              <button key={m.value} type="button" onClick={() => setMetodo(m.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  metodo === m.value
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-sky-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Notas adicionales <span className="normal-case font-normal">(opcional)</span>
          </span>
          <input type="text" value={notas} onChange={e => setNotas(e.target.value)}
            placeholder="Ej. férula nasal $350, taponamiento..."
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </label>
      </div>

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex gap-2 pt-1">
        {cobroInicial && (
          <button onClick={() => setEditando(false)}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button onClick={handleGuardar} disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} />
          {isPending ? 'Guardando…' : 'Guardar cobro'}
        </button>
      </div>
    </div>
  )
}
