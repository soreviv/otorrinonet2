'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Menu, X, Syringe, ChevronRight, RotateCcw, ShieldCheck, Info } from 'lucide-react'
import {
  obtenerRecomendaciones,
  CONDICIONES_LABELS,
  type FormVacunas,
  type Sexo,
  type Condicion,
  type VacunaRecomendada,
} from '@/lib/vaccine-recommendations'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Ubicación', href: '/ubicacion' },
  { label: 'Contacto', href: '/contacto' },
]

const CONDICIONES_BASE: Condicion[] = [
  'diabetes',
  'inmunosupresion',
  'cardiovascular',
  'pulmonar',
  'renal',
  'hepatica',
  'asplenia',
  'viajero',
]

const PRIORIDAD_BADGE: Record<string, string> = {
  rutina: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  recomendada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  condicional: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
}

const PRIORIDAD_LABEL: Record<string, string> = {
  rutina: 'Rutina',
  recomendada: 'Recomendada',
  condicional: 'Condicional',
}

const FUENTE_BADGE: Record<string, string> = {
  SSA: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  CDC: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'SSA+CDC': 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
}

interface Props {
  onBookAppointment: () => void
}

export function VaccineRecommendationPage({ onBookAppointment }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sexo, setSexo] = useState<Sexo | ''>('')
  const [edad, setEdad] = useState('')
  const [condiciones, setCondiciones] = useState<Set<Condicion>>(new Set())
  const [resultados, setResultados] = useState<VacunaRecomendada[] | null>(null)

  const condicionesList: Condicion[] =
    sexo === 'femenino' ? ['embarazo', ...CONDICIONES_BASE] : CONDICIONES_BASE

  const toggleCondicion = (c: Condicion) => {
    setCondiciones(prev => {
      const next = new Set(prev)
      next.has(c) ? next.delete(c) : next.add(c)
      return next
    })
    setResultados(null)
  }

  const canSubmit = sexo !== '' && edad !== '' && Number(edad) >= 0 && Number(edad) <= 120

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !sexo) return
    setResultados(
      obtenerRecomendaciones({
        sexo: sexo as Sexo,
        edad: Number(edad),
        condiciones: Array.from(condiciones),
      })
    )
  }

  const handleReset = () => {
    setSexo('')
    setEdad('')
    setCondiciones(new Set())
    setResultados(null)
  }

  const rutina = resultados?.filter(v => v.prioridad === 'rutina') ?? []
  const recomendada = resultados?.filter(v => v.prioridad === 'recomendada') ?? []
  const condicional = resultados?.filter(v => v.prioridad === 'condicional') ?? []

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <img src="/assets/logo-consultorio.png" alt="Dr. Alejandro Viveros Domínguez" width={40} height={40} className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    href === '/vacunacion'
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400'
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBookAppointment}
                className="hidden sm:flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-sky-200 dark:shadow-sky-900"
              >
                <Calendar className="w-3.5 h-3.5" />
                Agendar Cita
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:text-white"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 pt-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-slate-600 dark:text-slate-300 font-medium py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── HEADER ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900 mb-4">
            <Syringe className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Guía de Vacunación</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
            Basada en el Esquema Nacional de Vacunación de la SSA y las guías de la CDC.
            Ingresa tus datos para saber qué vacunas podrías necesitar.
          </p>
        </div>

        {/* ── FORMULARIO ── */}
        {resultados === null && (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8"
          >

            {/* Sexo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Sexo biológico
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['masculino', 'femenino'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSexo(s)
                      if (s === 'masculino') {
                        setCondiciones(prev => {
                          const next = new Set(prev)
                          next.delete('embarazo')
                          return next
                        })
                      }
                      setResultados(null)
                    }}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                      sexo === s
                        ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:border-sky-400 dark:text-sky-300'
                        : 'border-slate-200 text-slate-500 hover:border-sky-200 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-700'
                    }`}
                  >
                    {s === 'masculino' ? 'Masculino' : 'Femenino'}
                  </button>
                ))}
              </div>
            </div>

            {/* Edad */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Edad{' '}
                <span className="font-normal text-slate-400">(en años; escribe 0 si tiene menos de 1 año)</span>
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={edad}
                onChange={e => { setEdad(e.target.value); setResultados(null) }}
                placeholder="Ej: 35"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Condiciones */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Condiciones o situaciones especiales{' '}
                <span className="font-normal text-slate-400">(selecciona todas las que apliquen)</span>
              </label>
              <div className="space-y-2">
                {condicionesList.map(c => (
                  <label
                    key={c}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      condiciones.has(c)
                        ? 'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950'
                        : 'border-slate-100 hover:border-sky-200 dark:border-slate-800 dark:hover:border-sky-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={condiciones.has(c)}
                      onChange={() => toggleCondicion(c)}
                      className="w-4 h-4 rounded accent-sky-600 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{CONDICIONES_LABELS[c]}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Ver recomendaciones
            </button>
          </form>
        )}

        {/* ── RESULTADOS ── */}
        {resultados !== null && (
          <div className="space-y-6">

            {/* Cabecera resultados */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {resultados.length === 0
                    ? 'Sin vacunas pendientes detectadas'
                    : `${resultados.length} vacuna${resultados.length !== 1 ? 's' : ''} recomendada${resultados.length !== 1 ? 's' : ''}`}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {sexo === 'masculino' ? 'Masculino' : 'Femenino'},{' '}
                  {edad === '0' ? 'menor de 1 año' : `${edad} años`}
                  {condiciones.size > 0 && ` · ${condiciones.size} condición${condiciones.size !== 1 ? 'es' : ''} especial`}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors font-medium whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Nueva consulta
              </button>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-full font-medium ${PRIORIDAD_BADGE.rutina}`}>Rutina</span>
              <span className={`px-2.5 py-1 rounded-full font-medium ${PRIORIDAD_BADGE.recomendada}`}>Recomendada</span>
              <span className={`px-2.5 py-1 rounded-full font-medium ${PRIORIDAD_BADGE.condicional}`}>Condicional</span>
              <span className="mx-1 text-slate-300 dark:text-slate-600 self-center">|</span>
              <span className={`px-2.5 py-1 rounded-full font-medium ${FUENTE_BADGE.SSA}`}>SSA</span>
              <span className={`px-2.5 py-1 rounded-full font-medium ${FUENTE_BADGE.CDC}`}>CDC</span>
              <span className={`px-2.5 py-1 rounded-full font-medium ${FUENTE_BADGE['SSA+CDC']}`}>SSA+CDC</span>
            </div>

            {resultados.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                Con los datos ingresados no se identificaron vacunas pendientes en las guías de referencia.
                Consulta con tu médico para confirmar tu estado inmunológico.
              </div>
            )}

            {/* Grupos de vacunas */}
            {[
              { label: 'Esquema de rutina', items: rutina },
              { label: 'Vacunas recomendadas', items: recomendada },
              { label: 'Según condición o destino', items: condicional },
            ]
              .filter(g => g.items.length > 0)
              .map(group => (
                <div key={group.label}>
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    {group.label}
                  </h3>
                  <div className="space-y-3">
                    {group.items.map((v: VacunaRecomendada) => (
                      <div
                        key={v.nombre}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4"
                      >
                        <div className="flex flex-wrap items-start gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1 min-w-0">
                            {v.nombre}
                          </p>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORIDAD_BADGE[v.prioridad]}`}>
                              {PRIORIDAD_LABEL[v.prioridad]}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FUENTE_BADGE[v.fuente]}`}>
                              {v.fuente}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{v.descripcion}</p>
                        {v.nota && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-1.5">
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {v.nota}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {/* CTA */}
            {resultados.length > 0 && (
              <div className="bg-sky-50 dark:bg-sky-950 rounded-2xl border border-sky-100 dark:border-sky-900 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">¿Quieres aplicar tus vacunas?</p>
                  <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
                    El Dr. Viveros ofrece servicio de vacunación en el consultorio.
                  </p>
                </div>
                <button
                  onClick={onBookAppointment}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  Agendar cita
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-2xl border border-amber-100 dark:border-amber-900">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Aviso médico:</strong> Esta guía es de carácter informativo y se basa en los esquemas generales
                de la SSA y la CDC. No reemplaza la evaluación clínica individualizada. Las recomendaciones finales
                deben confirmarse con un médico, quien evaluará el historial de vacunación previo,
                contraindicaciones específicas y el estado de salud particular de cada persona.
              </p>
            </div>

          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-100 dark:border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} Dr. Alejandro Viveros Domínguez · Otorrinolaringología
        </div>
      </footer>
    </div>
  )
}
