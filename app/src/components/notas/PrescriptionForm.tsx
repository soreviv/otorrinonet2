'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import type { PrescriptionMedication } from '@/lib/notas-types'

const inputCls =
  'w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition'

const EMPTY_MED: PrescriptionMedication = {
  name: '', brandName: '', presentation: '', dose: '', frequency: '', duration: '', instructions: '', route: '',
}

interface Props {
  patientName: string
  onSave: (medications: PrescriptionMedication[], diagnosis: string) => Promise<void>
  onCancel: () => void
}

export function PrescriptionForm({ patientName, onSave, onCancel }: Props) {
  const [meds, setMeds] = useState<PrescriptionMedication[]>([{ ...EMPTY_MED }])
  const [diagnosis, setDiagnosis] = useState('')
  const [saving, setSaving] = useState(false)

  function setMed(i: number, field: keyof PrescriptionMedication, value: string) {
    setMeds(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  function addMed() {
    setMeds(prev => [...prev, { ...EMPTY_MED }])
  }

  function removeMed(i: number) {
    setMeds(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = meds.filter(m => m.name.trim() && m.dose.trim() && m.frequency.trim())
    if (!valid.length) return
    setSaving(true)
    try {
      await onSave(valid, diagnosis)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-50">Nueva receta médica</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">{patientName}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Diagnosis */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
            Diagnóstico / indicación
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            className={inputCls}
            placeholder="Ej. Otitis media aguda bilateral"
          />
        </div>

        {/* Medications */}
        <div className="space-y-3">
          {meds.map((med, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 text-xs font-bold">
                  {i + 1}
                </span>
                {meds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMed(i)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Nombre genérico <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={e => setMed(i, 'name', e.target.value)}
                      className={inputCls}
                      placeholder="Amoxicilina"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Nombre comercial
                    </label>
                    <input
                      type="text"
                      value={med.brandName ?? ''}
                      onChange={e => setMed(i, 'brandName', e.target.value)}
                      className={inputCls}
                      placeholder="Amoxil"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Presentación
                  </label>
                  <input
                    type="text"
                    value={med.presentation}
                    onChange={e => setMed(i, 'presentation', e.target.value)}
                    className={inputCls}
                    placeholder="Cápsulas 500mg"
                  />
                </div>

                {/* TODO(human): Aquí van los campos Dosis, Frecuencia, Duración y Vía de administración.
                    Decide cómo distribuirlos visualmente en la grilla (ej. 2×2, fila de 4, etc.)
                    Cada campo sigue el mismo patrón: label + input con inputCls.
                    El campo de vía usa: value={med.route ?? ''} onChange={e => setMed(i, 'route', e.target.value)}
                    placeholder sugerido: "Oral", "Sublingual", "Tópica", "IV", "IM" */}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Indicaciones adicionales
                  </label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={e => setMed(i, 'instructions', e.target.value)}
                    className={inputCls}
                    placeholder="Tomar con alimentos"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addMed}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Agregar medicamento
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white transition-colors"
          >
            <Save className="w-4 h-4" strokeWidth={2} />
            {saving ? 'Guardando…' : 'Crear receta'}
          </button>
        </div>
      </form>
    </div>
  )
}
