'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Trash2, AlertCircle } from 'lucide-react'

interface LogoUploaderProps {
  label: string
  helper?: string
  value: string
  onChange: (dataUrl: string) => void
}

const MAX_BYTES = 200 * 1024 // 200 KB de archivo origen

export function LogoUploader({ label, helper, value, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function pick() {
    inputRef.current?.click()
  }

  async function handleFile(file: File) {
    setError(null)
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/i.test(file.type)) {
      setError('Formato no soportado (usa PNG, JPG, WEBP o SVG).')
      return
    }
    if (file.size > MAX_BYTES) {
      setError(`Archivo demasiado grande (${Math.round(file.size / 1024)} KB · máx 200 KB).`)
      return
    }
    setBusy(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(r.result as string)
        r.onerror = () => reject(new Error('No se pudo leer el archivo.'))
        r.readAsDataURL(file)
      })
      onChange(dataUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-testid={`logo-uploader-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </label>

      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
          {value
            ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt={label} className="w-full h-full object-contain p-2" />
            )
            : <ImagePlus className="w-7 h-7 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {helper && <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={pick}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white transition-colors"
              data-testid="logo-uploader-pick"
            >
              {value ? 'Cambiar imagen' : 'Subir imagen'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setError(null) }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                data-testid="logo-uploader-remove"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                Quitar
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">PNG · JPG · WEBP · SVG · máx 200 KB</p>
          {error && (
            <p className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3 h-3" strokeWidth={2} />
              {error}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleFile(f)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
