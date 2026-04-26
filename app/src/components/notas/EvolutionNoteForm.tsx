'use client'

import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Cie10Search, type DiagnosticoSeleccionado } from '@/components/ehr/Cie10Search'

const textareaCls =
  'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none'

const inputCls =
  'w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition'

export interface EvolutionNoteData {
  subjective: string
  objective: string
  assessment: string
  plan: string
  diagnosticos: DiagnosticoSeleccionado[]
  vitals?: {
    presionSistolica?: number
    presionDiastolica?: number
    frecuenciaCardiaca?: number
    temperatura?: number
    saturacionOxigeno?: number
    peso?: number
    talla?: number
  }
}

interface Props {
  patientName: string
  onSave: (data: EvolutionNoteData) => Promise<void>
  onCancel: () => void
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
      {children}
    </label>
  )
}

export function EvolutionNoteForm({ patientName, onSave, onCancel }: Props) {
  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoSeleccionado[]>([])
  const [saving, setSaving] = useState(false)

  // Vitals (all optional)
  const [pSis, setPSis] = useState('')
  const [pDia, setPDia] = useState('')
  const [fc, setFc] = useState('')
  const [temp, setTemp] = useState('')
  const [spo2, setSpo2] = useState('')
  const [peso, setPeso] = useState('')
  const [talla, setTalla] = useState('')

  const canSave = subjective.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      await onSave({
        subjective,
        objective,
        assessment,
        plan,
        diagnosticos,
        vitals: {
          presionSistolica: pSis ? parseInt(pSis) : undefined,
          presionDiastolica: pDia ? parseInt(pDia) : undefined,
          frecuenciaCardiaca: fc ? parseInt(fc) : undefined,
          temperatura: temp ? parseFloat(temp) : undefined,
          saturacionOxigeno: spo2 ? parseInt(spo2) : undefined,
          peso: peso ? parseFloat(peso) : undefined,
          talla: talla ? parseFloat(talla) : undefined,
        },
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button type="button" onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-50">Nueva nota de evolución</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">{patientName}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* SOAP */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div>
            <Label>S — Subjetivo (motivo / síntomas) <span className="text-rose-500">*</span></Label>
            <textarea rows={3} value={subjective} onChange={e => setSubjective(e.target.value)}
              className={textareaCls} placeholder="¿Qué refiere el paciente?" required />
          </div>
          <div>
            <Label>O — Objetivo (exploración física ORL)</Label>
            <textarea rows={3} value={objective} onChange={e => setObjective(e.target.value)}
              className={textareaCls} placeholder="Hallazgos en exploración: oídos, nariz, garganta, cuello…" />
          </div>
          <div>
            <Label>A — Evaluación / Análisis</Label>
            <textarea rows={2} value={assessment} onChange={e => setAssessment(e.target.value)}
              className={textareaCls} placeholder="Impresión clínica, interpretación…" />
          </div>
          <div>
            <Label>P — Plan</Label>
            <textarea rows={3} value={plan} onChange={e => setPlan(e.target.value)}
              className={textareaCls} placeholder="Tratamiento, estudios, referencia, seguimiento…" />
          </div>
        </div>

        {/* CIE-10 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <Cie10Search value={diagnosticos} onChange={setDiagnosticos} maxDiagnosticos={5} />
        </div>

        {/* Signos vitales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <Label>Signos vitales (opcional)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">T/A Sistólica</label>
              <input type="number" value={pSis} onChange={e => setPSis(e.target.value)} className={inputCls} placeholder="120" min={50} max={250} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">T/A Diastólica</label>
              <input type="number" value={pDia} onChange={e => setPDia(e.target.value)} className={inputCls} placeholder="80" min={30} max={150} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Frec. Cardíaca (lpm)</label>
              <input type="number" value={fc} onChange={e => setFc(e.target.value)} className={inputCls} placeholder="72" min={30} max={250} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Temperatura (°C)</label>
              <input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} className={inputCls} placeholder="36.5" min={34} max={42} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">SpO₂ (%)</label>
              <input type="number" value={spo2} onChange={e => setSpo2(e.target.value)} className={inputCls} placeholder="98" min={70} max={100} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Peso (kg)</label>
              <input type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} className={inputCls} placeholder="70" min={1} max={300} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Talla (cm)</label>
              <input type="number" value={talla} onChange={e => setTalla(e.target.value)} className={inputCls} placeholder="170" min={30} max={250} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving || !canSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white transition-colors">
            <Save className="w-4 h-4" strokeWidth={2} />
            {saving ? 'Guardando…' : 'Guardar nota'}
          </button>
        </div>
      </form>
    </div>
  )
}
