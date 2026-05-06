import { prisma } from '@/lib/prisma'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { CheckCircle, XCircle, AlertTriangle, Pill, Calendar, User, FileText, Building2 } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ hash?: string }>
}

function formatDate(d: Date) {
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function VerificarRecetaPage({ params, searchParams }: Props) {
  const { id: recetaId } = await params
  const { hash } = await searchParams

  const [rows, cfg] = await Promise.all([
    prisma.prescription.findMany({
      where: { recetaId },
      include: { patient: { select: { nombre: true, apellidoPaterno: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    getClinicConfigFromDB(),
  ])

  // Receta no encontrada
  if (!rows.length) {
    return (
      <Page>
        <StatusCard
          icon={<XCircle className="w-12 h-12 text-red-500" />}
          title="Receta no encontrada"
          description="El código QR no corresponde a ninguna receta registrada en este sistema."
          color="red"
        />
      </Page>
    )
  }

  const first = rows[0]
  const firmada = first.firmada
  const firmaHash = first.firmaHash

  // Verificar hash si se proporcionó
  const hashValido = !hash || firmaHash === hash

  return (
    <Page>
      <div className="max-w-lg w-full space-y-4">
        {/* Estado de autenticidad */}
        {firmada && hashValido ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex gap-4 items-start">
            <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-800 text-base">Receta auténtica</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                Esta receta fue firmada electrónicamente y su integridad está verificada.
              </p>
            </div>
          </div>
        ) : !firmada ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-base">Receta sin firma</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Esta receta existe en el sistema pero aún no ha sido firmada electrónicamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-4 items-start">
            <XCircle className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-base">Hash no coincide</p>
              <p className="text-sm text-red-700 mt-0.5">
                La receta existe pero el código de verificación no coincide. Puede haber sido alterada.
              </p>
            </div>
          </div>
        )}

        {/* Datos del consultorio y médico */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-sky-700 px-5 py-4">
            <p className="text-white font-bold text-base">{cfg.clinicName}</p>
            {cfg.clinicAddress && <p className="text-sky-200 text-xs mt-0.5">{cfg.clinicAddress}</p>}
          </div>
          <div className="p-5 space-y-3">
            <Row icon={<User className="w-4 h-4 text-sky-600" />} label="Médico" value={cfg.doctorName} />
            {cfg.doctorLicense && (
              <Row icon={<FileText className="w-4 h-4 text-slate-400" />} label="Cédula profesional" value={cfg.doctorLicense} mono />
            )}
            {cfg.doctorSpecialtyLicense && (
              <Row icon={<FileText className="w-4 h-4 text-blue-400" />} label="Cédula de especialidad" value={cfg.doctorSpecialtyLicense} mono />
            )}
            {cfg.doctorUniversity && (
              <Row icon={<Building2 className="w-4 h-4 text-slate-400" />} label="Universidad" value={cfg.doctorUniversity} />
            )}
          </div>
        </div>

        {/* Datos de la receta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <Row
            icon={<User className="w-4 h-4 text-slate-400" />}
            label="Paciente"
            value={`${first.patient.nombre} ${first.patient.apellidoPaterno}`}
          />
          <Row
            icon={<Calendar className="w-4 h-4 text-slate-400" />}
            label="Fecha de expedición"
            value={formatDate(first.createdAt)}
          />
          {first.fechaFirma && (
            <Row
              icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
              label="Firmada el"
              value={first.fechaFirma.toLocaleString('es-MX', {
                timeZone: 'America/Mexico_City',
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            />
          )}
          {firmaHash && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">SHA-256</p>
              <p className="font-mono text-[10px] text-slate-500 break-all bg-slate-50 rounded-lg px-3 py-2">{firmaHash}</p>
            </div>
          )}
        </div>

        {/* Medicamentos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5" />
            Medicamentos prescritos
          </p>
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li key={r.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.medicamento}</p>
                  <p className="text-xs text-slate-500">{r.dosis} · {r.frecuencia}{r.duracion ? ` · ${r.duracion}` : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-slate-400">
          Verificación conforme a NOM-004-SSA3-2012 y NOM-024-SSA3-2012
        </p>
      </div>
    </Page>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-10 px-4">
      {children}
    </div>
  )
}

function Row({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-sm text-slate-800 mt-0.5 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</p>
      </div>
    </div>
  )
}

function StatusCard({ icon, title, description, color }: {
  icon: React.ReactNode; title: string; description: string; color: 'red' | 'amber' | 'emerald'
}) {
  const colors = {
    red: 'bg-red-50 border-red-200',
    amber: 'bg-amber-50 border-amber-200',
    emerald: 'bg-emerald-50 border-emerald-200',
  }
  return (
    <div className={`max-w-lg w-full border rounded-2xl p-8 flex flex-col items-center text-center gap-4 ${colors[color]}`}>
      {icon}
      <div>
        <p className="font-bold text-slate-800 text-lg">{title}</p>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
    </div>
  )
}
