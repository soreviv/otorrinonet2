'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { searchCie10 } from '@/app/actions/cie10'
import type { Cie10Result } from '@/app/actions/cie10'

export interface DiagnosticoSeleccionado {
  codigo: string
  descripcion: string
}

interface Props {
  value: DiagnosticoSeleccionado[]
  onChange: (value: DiagnosticoSeleccionado[]) => void
  maxDiagnosticos?: number
  disabled?: boolean
  label?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function Cie10Search({ value, onChange, maxDiagnosticos = 5, disabled = false, label = 'Diagnóstico(s) CIE-10' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Cie10Result[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debouncedQuery = useDebounce(query, 250)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await searchCie10(q)
      const filtered = res.filter(r => !value.some(v => v.codigo === r.codigo))
      setResults(filtered.slice(0, 20))
      setOpen(filtered.length > 0)
      setActiveIdx(-1)
    } finally {
      setLoading(false)
    }
  }, [value])

  useEffect(() => { search(debouncedQuery) }, [debouncedQuery, search])

  function select(item: Cie10Result) {
    if (value.length >= maxDiagnosticos) return
    onChange([...value, { codigo: item.codigo, descripcion: item.descripcion }])
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  function remove(codigo: string) {
    onChange(value.filter(v => v.codigo !== codigo))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); select(results[activeIdx]) }
    if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1) }
  }

  const atMax = value.length >= maxDiagnosticos

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
        {label}
      </label>

      {/* Selected badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map(dx => (
            <span
              key={dx.codigo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300"
            >
              <span className="font-mono font-bold">{dx.codigo}</span>
              <span className="text-sky-600 dark:text-sky-400 truncate max-w-[200px]">{dx.descripcion}</span>
              {!disabled && (
                <button type="button" onClick={() => remove(dx.codigo)} className="ml-0.5 text-sky-400 hover:text-rose-500 transition-colors">
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      {!disabled && !atMax && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={1.75} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Busca por nombre o código CIE-10…"
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            )}
            {!loading && query && (
              <button type="button" onClick={() => { setQuery(''); setOpen(false) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          {open && results.length > 0 && (
            <ul
              ref={listRef}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-y-auto max-h-64"
            >
              {results.map((r, i) => (
                <li
                  key={r.codigo}
                  onMouseDown={() => select(r)}
                  className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    i === activeIdx
                      ? 'bg-sky-50 dark:bg-sky-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="shrink-0 font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40 px-1.5 py-0.5 rounded mt-0.5">
                    {r.codigo}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">{r.descripcion}</p>
                    {r.categoria && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{r.categoria}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {atMax && !disabled && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Máximo {maxDiagnosticos} diagnósticos por nota.</p>
      )}
    </div>
  )
}
