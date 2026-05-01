'use client'

import { useState } from 'react'

const TIPOS = [
  { value: 'Aviso de Privacidad', label: 'Aviso de Privacidad' },
  { value: 'Consentimiento para Tratamiento', label: 'Consentimiento para Tratamiento' },
  { value: 'Consentimiento para Procedimiento', label: 'Consentimiento para Procedimiento' },
  { value: 'Consentimiento para Cirugía', label: 'Consentimiento para Cirugía' },
  { value: 'Autorización de Expediente Electrónico', label: 'Autorización de Expediente Electrónico' },
]

interface Props {
  patientName: string
  onSave: (type: string, content: string) => Promise<void>
  onCancel: () => void
}

export function ConsentFormCreate({ patientName, onSave, onCancel }: Props) {
  const [tipo, setTipo] = useState(TIPOS[0].value)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(tipo, content)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onCancel}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Nuevo Consentimiento</h1>
            <p className="text-xs text-slate-400">{patientName}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Tipo de consentimiento
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            >
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Texto del consentimiento <span className="text-slate-400">(opcional)</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              placeholder="Descripción o cláusulas específicas del consentimiento..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium py-2.5 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-sm font-semibold py-2.5 transition-colors">
            {saving ? 'Guardando…' : 'Crear consentimiento'}
          </button>
        </div>
      </form>
    </div>
  )
}
