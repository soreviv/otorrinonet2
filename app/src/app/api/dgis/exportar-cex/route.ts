import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { buildGiisFile, giisFilename, noteToGiisRow } from '@/lib/giis-b015'
import { decrypt } from '@/lib/crypto'

export async function GET(req: NextRequest) {
  try {
    await verifySession()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const mesParam = req.nextUrl.searchParams.get('mes') // YYYY-MM
  if (!mesParam || !/^\d{4}-\d{2}$/.test(mesParam)) {
    return NextResponse.json({ error: 'Parámetro mes requerido (YYYY-MM)' }, { status: 400 })
  }

  const [anio, mes] = mesParam.split('-').map(Number)
  const desde = new Date(anio, mes - 1, 1)
  const hasta = new Date(anio, mes, 1)

  const [clinic, notas] = await Promise.all([
    getClinicConfigFromDB(),
    prisma.medicalNote.findMany({
      where: {
        tipo: 'nota_evolucion',
        firmada: true,
        fecha: { gte: desde, lt: hasta },
      },
      select: {
        id: true,
        fecha: true,
        patientId: true,
        servicioAtencion: true,
        sintomaticoRespTb: true,
        primeraVezAnio: true,
        primeraVezUneme: true,
        diagnoses: {
          select: { cie10Codigo: true },
        },
        vitals: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            peso: true,
            talla: true,
            circunferenciaCintura: true,
            presionSistolica: true,
            presionDiastolica: true,
            frecuenciaCardiaca: true,
            frecuenciaRespiratoria: true,
            temperatura: true,
            saturacionOxigeno: true,
            glucosa: true,
          },
        },
        patient: {
          select: {
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            fechaNacimiento: true,
            curp: true,
            paisNacimiento: true,
            entidadNacimiento: true,
            sexoCurp: true,
            sexoBiologico: true,
            genero: true,
            derechohabiencia: true,
            seConsideraIndigena: true,
            seAutodenominaAfromexicano: true,
            migrante: true,
            paisProcedencia: true,
          },
        },
      },
      orderBy: { fecha: 'asc' },
    }),
  ])

  const rows = notas.map(n => {
    const curpDecrypted = n.patient.curp
      ? (() => { try { return decrypt(n.patient.curp!) } catch { return n.patient.curp } })()
      : null

    return noteToGiisRow(
      {
        id: n.id,
        fecha: n.fecha,
        patientId: n.patientId,
        servicioAtencion: n.servicioAtencion,
        sintomaticoRespTb: n.sintomaticoRespTb,
        primeraVezAnio: n.primeraVezAnio,
        primeraVezUneme: n.primeraVezUneme,
        diagnoses: n.diagnoses.map(d => ({ codigo: d.cie10Codigo })),
        vitals: n.vitals[0] ?? null,
        patient: { ...n.patient, curp: curpDecrypted },
      },
      {
        clues: clinic.clues,
        curpPrestador: clinic.curpPrestador,
        doctorName: clinic.doctorName,
        servicioAtencionCex: clinic.servicioAtencionCex,
      },
    )
  })

  const contenido = buildGiisFile(rows)
  const filename = giisFilename(clinic.clues, anio, mes)

  return new NextResponse(contenido, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
