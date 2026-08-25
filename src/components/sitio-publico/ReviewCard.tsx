'use client'

import { Star, Quote } from 'lucide-react'
import type { GoogleReview } from '@/lib/sitio-publico-types'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  )
}

interface ReviewCardProps {
  review: GoogleReview
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">{review.authorInitials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{review.authorName}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRow rating={review.rating} />
            <span className="text-[10px] text-slate-400 font-medium">{review.source}</span>
          </div>
        </div>
        <Quote className="w-4 h-4 text-sky-200 flex-shrink-0 mt-0.5" />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">{review.text}</p>
    </div>
  )
}
