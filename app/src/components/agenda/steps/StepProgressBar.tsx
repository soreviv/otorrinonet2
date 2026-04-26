'use client'

import { memo } from 'react'
import { Check } from 'lucide-react'

interface StepProgressBarProps {
  steps: readonly string[]
  current: number
}

export const StepProgressBar = memo(function StepProgressBar({ steps, current }: StepProgressBarProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? 'bg-sky-600 text-white'
                    : active
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100 dark:ring-sky-900/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active
                    ? 'text-sky-600 dark:text-sky-400'
                    : done
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors ${
                  done ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
})
