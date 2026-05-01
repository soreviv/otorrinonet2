export default function AgendarLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Header skeleton */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse mx-auto" />
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mx-auto" />
          <div className="h-4 w-40 bg-slate-100 dark:bg-slate-900 rounded animate-pulse mx-auto" />
        </div>

        {/* Card skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                {i < 2 && (
                  <div className="flex-1 h-0.5 bg-slate-100 dark:bg-slate-800 mx-1 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Calendar + timeslot skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="flex items-center justify-center h-40 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Nav bar skeleton */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="h-8 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="flex gap-1.5">
              {[0, 1].map((i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ))}
            </div>
            <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
