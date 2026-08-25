export const metadata = { title: 'Cita cancelada — ORL Viveros' }

export default function CitaCanceladaPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Cita cancelada</h1>
        <p className="text-slate-500 text-sm mb-6">
          Su cita ha sido cancelada. Si desea agendar una nueva consulta puede hacerlo en cualquier momento.
        </p>
        <a
          href="/agendar"
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Agendar nueva cita
        </a>
      </div>
    </main>
  )
}
