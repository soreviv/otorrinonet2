'use client'

import { useCallback, useState } from 'react'
import { Upload, Loader2, AlertCircle } from 'lucide-react'

interface ImagenUploaderProps {
  onUpload: (url: string) => void
  disabled?: boolean
}

export function ImagenUploader({ onUpload, disabled }: ImagenUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const upload = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.append('imagen', file)
    try {
      const res = await fetch('/api/tienda/upload-imagen', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen')
      onUpload(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [upload])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  return (
    <div>
      <label
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 transition-colors
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${dragging
            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled && !loading) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleChange}
          disabled={loading || disabled}
        />
        {loading
          ? <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
          : <Upload className="w-7 h-7 text-slate-400" />
        }
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          {loading ? 'Subiendo...' : 'Arrastra una imagen o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-slate-400">JPG, PNG, WebP, GIF · máx. 5 MB</p>
      </label>
      {error && (
        <p className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
