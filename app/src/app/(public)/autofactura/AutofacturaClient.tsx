'use client'

import { useState, useTransition } from 'react'
import { PublicHeader } from '@/components/sitio-publico/PublicHeader'
import { PublicFooter } from '@/components/sitio-publico/PublicFooter'
import {
  buscarPacienteParaFactura,
  getCobrosFacturables,
  guardarDatosFiscales,
  emitirCfdi,
  type PacienteAutofactura,
  type CobroPendiente,
} from '@/app/actions/autofactura'
import { FileText, Search, Check, AlertCircle, ChevronRight, Receipt } from 'lucide-react'

// ─── Catálogos SAT ────────────────────────────────────────────────────────────

const REGIMENES = [
  { value: '605', label: '605 — Sueldos y Salarios' },
  { value: '606', label: '606 — Arrendamiento' },
  { value: '608', label: '608 — Demás ingresos' },
  { value: '612', label: '612 — Actividades Empresariales y Profesionales' },
  { value: '616', label: '616 — Sin obligaciones fiscales' },
  { value: '621', label: '621 — Incorporación Fiscal' },
  { value: '626', label: '626 — Régimen Simplificado de Confianza (RESICO)' },
]

const USOS_CFDI = [
  { value: 'D01', label: 'D01 — Honorarios médicos y gastos hospitalarios' },
  { value: 'G03', label: 'G03 — Gastos en general' },
  { value: 'S01', label: 'S01 — Sin efectos fiscales' },
]

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(centavos / 100)
}

// ─── Step 1: Buscar expediente ────────────────────────────────────────────────

function StepBuscar({ onEncontrado }: {
  onEncontrado: (p: PacienteAutofactura, cobros: CobroPendiente[]) => void
}) {
  const [expediente, setExpediente] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleBuscar() {
    setError('')
    startTransition(async () => {
      const res = await buscarPacienteParaFactura(expediente, email)
      if (!res.ok) { setError(res.error); return }
      const cobros = await getCobrosFacturables(res.paciente.id)
      onEncontrado(res.paciente, cobros)
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mx-auto">
          <Receipt className="w-7 h-7 text-sky-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Autofacturación</h1>
        <p className="text-sm text-slate-500">
          Ingresa tu número de expediente y correo para generar tu CFDI del mes en curso.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Número de expediente</span>
          <input
            type="text"
            value={expediente}
            onChange={e => setExpediente(e.target.value.toUpperCase())}
            placeholder="ORL-00042"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
          />
          <p className="mt-1 text-xs text-slate-400">Lo puedes encontrar en tu hoja de consulta.</p>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </label>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleBuscar}
          disabled={isPending || !expediente.trim() || !email.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          <Search className="w-4 h-4" />
          {isPending ? 'Buscando…' : 'Buscar expediente'}
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Seleccionar cobro y datos fiscales ───────────────────────────────

function StepFacturar({
  paciente,
  cobros,
  onFacturada,
}: {
  paciente: PacienteAutofactura
  cobros: CobroPendiente[]
  onFacturada: (uuid: string) => void
}) {
  const df = paciente.datosFiscales
  const [rfc, setRfc]                     = useState(df.rfc ?? '')
  const [razonSocial, setRazonSocial]     = useState(df.razonSocialFiscal ?? `${paciente.nombre} ${paciente.apellidoPaterno}`)
  const [regimen, setRegimen]             = useState(df.regimenFiscal ?? '605')
  const [cp, setCp]                       = useState(df.cpFiscal ?? '')
  const [usoCfdi, setUsoCfdi]             = useState(df.usoCfdi ?? 'D01')
  const [cobroSelId, setCobroSelId]       = useState<string>(cobros[0]?.id ?? '')
  const [error, setError]                 = useState('')
  const [isPending, startTransition]      = useTransition()

  const cobroSel = cobros.find(c => c.id === cobroSelId)

  function handleEmitir() {
    if (!cobroSelId) { setError('Selecciona una consulta'); return }
    setError('')
    startTransition(async () => {
      const guardado = await guardarDatosFiscales(paciente.id, {
        rfc, razonSocial, regimenFiscal: regimen, cpFiscal: cp, usoCfdi,
      })
      if (!guardado.ok) { setError(guardado.error ?? 'Error al guardar datos fiscales'); return }

      const res = await emitirCfdi(cobroSelId, paciente.id)
      if (!res.ok) { setError(res.error ?? 'Error al generar CFDI'); return }
      onFacturada(res.uuid ?? '')
    })
  }

  if (cobros.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1} />
          <p className="font-semibold text-slate-700">Sin consultas pendientes de facturar</p>
          <p className="text-sm text-slate-400 mt-1">
            No tienes cobros del mes actual disponibles para facturar, o ya fueron todos facturados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <p className="text-sm text-slate-500">Expediente: <span className="font-mono font-semibold text-slate-800">{paciente.expedienteNumber}</span></p>
        <h2 className="text-xl font-bold text-slate-900 mt-0.5">
          {paciente.nombre} {paciente.apellidoPaterno} {paciente.apellidoMaterno}
        </h2>
      </div>

      {/* Selección de consulta */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700">Consulta a facturar</p>
        {cobros.map(c => (
          <button
            key={c.id}
            onClick={() => setCobroSelId(c.id)}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              cobroSelId === c.id
                ? 'border-sky-500 bg-sky-50'
                : 'border-slate-200 hover:border-sky-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{c.tipoLabel}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.fecha}</p>
              </div>
              <p className="text-sm font-bold text-emerald-700">{formatMXN(c.montoTotal)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Datos fiscales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700">Datos fiscales del receptor</p>
        {df.rfc && (
          <p className="text-xs text-sky-600 bg-sky-50 rounded-lg px-3 py-2">
            Tus datos fiscales están guardados. Puedes modificarlos si cambiaron.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block">
            <span className="text-xs font-medium text-slate-600">RFC</span>
            <input value={rfc} onChange={e => setRfc(e.target.value.toUpperCase())}
              placeholder="XAXX010101000"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>

          <label className="col-span-2 block">
            <span className="text-xs font-medium text-slate-600">Nombre o razón social (fiscal)</span>
            <input value={razonSocial} onChange={e => setRazonSocial(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Régimen fiscal</span>
            <select value={regimen} onChange={e => setRegimen(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {REGIMENES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">CP fiscal</span>
            <input value={cp} onChange={e => setCp(e.target.value)} maxLength={5} placeholder="06600"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>

          <label className="col-span-2 block">
            <span className="text-xs font-medium text-slate-600">Uso del CFDI</span>
            <select value={usoCfdi} onChange={e => setUsoCfdi(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {USOS_CFDI.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {cobroSel && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">Total a facturar</span>
          <span className="font-bold text-slate-900 text-base">{formatMXN(cobroSel.montoTotal)}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleEmitir}
        disabled={isPending || !cobroSelId || !rfc || !cp}
        className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
      >
        <ChevronRight className="w-4 h-4" />
        {isPending ? 'Generando CFDI…' : 'Generar y enviar factura por correo'}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Tu CFDI llegará al correo registrado en tu expediente. Solo puedes facturar consultas del mes en curso.
      </p>
    </div>
  )
}

// ─── Step 3: Éxito ────────────────────────────────────────────────────────────

function StepExito({ uuid }: { uuid: string }) {
  return (
    <div className="max-w-md mx-auto text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-emerald-600" strokeWidth={2} />
      </div>
      <h2 className="text-xl font-bold text-slate-900">¡Factura generada!</h2>
      <p className="text-sm text-slate-500">
        Tu CFDI fue timbrado correctamente y enviado a tu correo electrónico.
      </p>
      {uuid && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-400 mb-1">Folio fiscal (UUID)</p>
          <p className="text-xs font-mono text-slate-700 break-all">{uuid}</p>
        </div>
      )}
      <p className="text-xs text-slate-400">
        Si no encuentras el correo, revisa tu carpeta de spam.
      </p>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function AutofacturaClient() {
  const [step, setStep] = useState<'buscar' | 'facturar' | 'exito'>('buscar')
  const [paciente, setPaciente] = useState<PacienteAutofactura | null>(null)
  const [cobros, setCobros] = useState<CobroPendiente[]>([])
  const [uuid, setUuid] = useState('')

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        {step === 'buscar' && (
          <StepBuscar
            onEncontrado={(p, c) => { setPaciente(p); setCobros(c); setStep('facturar') }}
          />
        )}
        {step === 'facturar' && paciente && (
          <StepFacturar
            paciente={paciente}
            cobros={cobros}
            onFacturada={u => { setUuid(u); setStep('exito') }}
          />
        )}
        {step === 'exito' && <StepExito uuid={uuid} />}
      </main>
      <PublicFooter />
    </>
  )
}
