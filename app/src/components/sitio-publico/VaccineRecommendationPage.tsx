'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import { Breadcrumbs } from './Breadcrumbs'
import {
  Calendar, Syringe, ShieldCheck, Info,
  RefreshCw, AlertTriangle, MapPin,
} from 'lucide-react'
import {
  getRecommendations,
  CONDITION_GROUPS,
  CONDITION_LABELS,
  PRIORITY_LABEL,
  PRIORITY_COLOR,
  SOURCE_LABEL,
  SOURCE_COLOR,
  type Condition,
  type Priority,
  type VaccineResult,
} from '@/lib/vaccine-recommendations'

type AgeUnit = 'meses' | 'años'
type Sex = 'male' | 'female'

const ORDERED_PRIORITIES: Priority[] = ['routine', 'recommended', 'shared-decision']

function groupByPriority(vaccines: VaccineResult[]): Record<Priority, VaccineResult[]> {
  const groups: Record<Priority, VaccineResult[]> = {
    routine: [],
    recommended: [],
    'shared-decision': [],
  }
  for (const v of vaccines) groups[v.priority].push(v)
  return groups
}

export function VaccineRecommendationPage() {
  const [ageValue,     setAgeValue]     = useState('')
  const [ageUnit,      setAgeUnit]      = useState<AgeUnit>('años')
  const [sex,          setSex]          = useState<Sex | ''>('')
  const [conditions,   setConditions]   = useState<Set<Condition>>(new Set())
  const [noneSelected, setNoneSelected] = useState(false)
  const [privacyOk,    setPrivacyOk]    = useState(false)
  const [results,      setResults]      = useState<VaccineResult[] | null>(null)
  const [submitted,    setSubmitted]    = useState(false)

  const conditionsDone = noneSelected || conditions.size > 0
  const canSubmit = !!ageValue && !!sex && conditionsDone && privacyOk

  function toggleCondition(c: Condition) {
    setNoneSelected(false)
    setConditions(prev => {
      const next = new Set(prev)
      next.has(c) ? next.delete(c) : next.add(c)
      return next
    })
  }

  function toggleNone() {
    setConditions(new Set())
    setNoneSelected(v => !v)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !sex) return
    const raw = parseFloat(ageValue)
    if (isNaN(raw) || raw < 0) return
    const ageYears = ageUnit === 'meses' ? raw / 12 : raw
    setResults(getRecommendations(ageYears, sex as Sex, Array.from(conditions)))
    setSubmitted(true)
  }

  function handleReset() {
    setAgeValue('')
    setAgeUnit('años')
    setSex('')
    setConditions(new Set())
    setNoneSelected(false)
    setPrivacyOk(false)
    setResults(null)
    setSubmitted(false)
  }

  const groups = results ? groupByPriority(results) : null

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">

      <PublicHeader />
      <Breadcrumbs items={[{ label: 'Vacunación en Adultos', href: '/vacunacion' }]} />

      {/* ── HERO ── */}
      <section className="bg-white border-b border-slate-100 dark:bg-slate-900 dark:border-slate-800 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900 mb-4">
            <Syringe className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Guía de Vacunación
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Consulta las vacunas recomendadas según tu edad, sexo y condición de salud,
            con base en la Cartilla Nacional de Vacunación (SSA) y el calendario del CDC.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* ── FORMULARIO ── */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Datos generales */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Datos generales</h2>
              </div>
              <div className="px-6 py-5 space-y-5">

                {/* Edad */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Edad <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      step="1"
                      value={ageValue}
                      onChange={e => setAgeValue(e.target.value)}
                      placeholder="Ej. 35"
                      required
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    />
                    <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-sm">
                      {(['meses', 'años'] as AgeUnit[]).map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setAgeUnit(u)}
                          className={`px-4 py-2.5 font-medium transition-colors ${
                            ageUnit === u
                              ? 'bg-sky-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                  {ageUnit === 'meses' && (
                    <p className="text-xs text-slate-400 mt-1">
                      Usa meses para bebés menores de 2 años.
                    </p>
                  )}
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sexo biológico <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    {([
                      { value: 'female' as Sex, label: 'Femenino' },
                      { value: 'male'   as Sex, label: 'Masculino' },
                    ]).map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSex(value)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          sex === value
                            ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:border-sky-400 dark:text-sky-300'
                            : 'border-slate-200 text-slate-500 hover:border-sky-200 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Condiciones médicas */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Condiciones médicas <span className="text-red-500">*</span>
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Selecciona todas las que apliquen. Esto personaliza las recomendaciones de vacunación.
                </p>
              </div>
              <div className="px-6 py-5 space-y-6">
                {CONDITION_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {group.conditions.map(c => (
                        <label
                          key={c}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            conditions.has(c)
                              ? 'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950'
                              : 'border-slate-100 hover:border-sky-200 dark:border-slate-800 dark:hover:border-sky-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={conditions.has(c)}
                            onChange={() => toggleCondition(c)}
                            className="w-4 h-4 rounded accent-sky-600 flex-shrink-0"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{CONDITION_LABELS[c]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Ninguna */}
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    noneSelected
                      ? 'border-slate-400 bg-slate-50 dark:border-slate-500 dark:bg-slate-800'
                      : 'border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={noneSelected}
                    onChange={toggleNone}
                    className="w-4 h-4 rounded accent-sky-600 flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ninguna de las anteriores
                  </span>
                </label>

                {!conditionsDone && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Debes seleccionar al menos una opción para continuar.
                  </p>
                )}
              </div>
            </div>

            {/* Aviso de privacidad */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-6 py-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyOk}
                  onChange={e => setPrivacyOk(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-sky-600 flex-shrink-0"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  He leído y acepto el{' '}
                  <Link href="/privacidad" className="text-sky-600 underline hover:text-sky-700 dark:text-sky-400">
                    Aviso de Privacidad
                  </Link>
                  . Entiendo que los datos ingresados se utilizan únicamente para generar
                  esta guía informativa y no son almacenados.{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Ver mis vacunas recomendadas
            </button>
          </form>
        )}

        {/* ── RESULTADOS ── */}
        {submitted && results !== null && (
          <div className="space-y-6">

            {/* Encabezado */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {results.length > 0
                    ? `${results.length} vacuna${results.length !== 1 ? 's' : ''} recomendada${results.length !== 1 ? 's' : ''}`
                    : 'Sin recomendaciones específicas'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Basado en Cartilla Nacional de Vacunación SSA 2024 y calendario CDC 2025
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors font-medium whitespace-nowrap border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Nueva consulta
              </button>
            </div>

            {results.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No se encontraron vacunas aplicables para los datos ingresados.
                Consulta con tu médico para una valoración personalizada.
              </div>
            )}

            {/* Grupos por prioridad */}
            {ORDERED_PRIORITIES.map(priority => {
              const items = groups![priority]
              if (!items.length) return null
              return (
                <div key={priority}>
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    {PRIORITY_LABEL[priority]}
                  </h3>
                  <div className="space-y-3">
                    {items.map(v => (
                      <div
                        key={v.id}
                        className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 sm:p-5 transition-shadow hover:shadow-md ${
                          v.triggeredByCondition
                            ? 'border-amber-200 dark:border-amber-800'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Nombre + badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{v.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_COLOR[v.priority]}`}>
                            {v.shortName}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${SOURCE_COLOR[v.source]}`}>
                            {SOURCE_LABEL[v.source]}
                          </span>
                          {v.annual && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-300">
                              Anual
                            </span>
                          )}
                          {v.triggeredByCondition && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300">
                              Por condición médica
                            </span>
                          )}
                        </div>

                        {/* Descripción */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{v.description}</p>

                        {/* Nota por condición */}
                        {v.triggeredByCondition && v.conditionNote && (
                          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 rounded-xl px-3 py-2 mb-2 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            {v.conditionNote}
                          </p>
                        )}

                        {/* Nota general */}
                        {v.note && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            {v.note}
                          </p>
                        )}

                        {/* Contraindicación */}
                        {v.contraindications?.some(c => Array.from(conditions).includes(c)) && (
                          <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-xl px-3 py-2 mt-2 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span><strong>Precaución:</strong> {v.contraindicationNote}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* CTA */}
            {results.length > 0 && (
              <div className="bg-sky-50 dark:bg-sky-950 rounded-2xl border border-sky-100 dark:border-sky-900 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">¿Quieres aplicar tus vacunas?</p>
                  <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
                    El Dr. Viveros ofrece servicio de vacunación en el consultorio.
                  </p>
                </div>
                <Link
                  href="/agendar"
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  Agendar cita
                </Link>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-2xl border border-amber-100 dark:border-amber-900">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Esta guía es informativa y está basada en la Cartilla Nacional de Vacunación SSA 2024
                y el calendario del CDC 2025. No sustituye la valoración médica individual.
                Consulta con tu médico para confirmar qué vacunas necesitas según tu historial clínico completo.
              </p>
            </div>

          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
