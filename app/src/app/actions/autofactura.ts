'use server'

import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/crypto'
import { generarCfdi, type DatosFiscales } from '@/lib/factura-com'
import { TIPOS_CONSULTA } from '@/lib/cobros-data'

export interface PacienteAutofactura {
  id: string
  expedienteNumber: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  email: string
  datosFiscales: {
    rfc: string | null
    razonSocialFiscal: string | null
    regimenFiscal: string | null
    cpFiscal: string | null
    usoCfdi: string | null
  }
}

export interface CobroPendiente {
  id: string
  appointmentId: string
  tipoConsulta: string
  tipoLabel: string
  montoTotal: number
  metodoPago: string
  cobradoAt: string
  fecha: string
}

export async function buscarPacienteParaFactura(
  expediente: string,
  email: string,
): Promise<{ ok: true; paciente: PacienteAutofactura } | { ok: false; error: string }> {
  if (!expediente.trim() || !email.trim()) {
    return { ok: false, error: 'Ingresa número de expediente y correo' }
  }

  const patient = await prisma.patient.findFirst({
    where: {
      expedienteNumber: { equals: expediente.trim(), mode: 'insensitive' },
      status: 'activo',
    },
  })

  if (!patient) {
    return { ok: false, error: 'Expediente no encontrado' }
  }

  const emailDecrypted = patient.email ? decrypt(patient.email) : ''
  if (emailDecrypted.toLowerCase() !== email.trim().toLowerCase()) {
    return { ok: false, error: 'El correo no coincide con el expediente' }
  }

  return {
    ok: true,
    paciente: {
      id: patient.id,
      expedienteNumber: patient.expedienteNumber,
      nombre: patient.nombre,
      apellidoPaterno: patient.apellidoPaterno,
      apellidoMaterno: patient.apellidoMaterno,
      email: emailDecrypted,
      datosFiscales: {
        rfc: patient.rfc,
        razonSocialFiscal: patient.razonSocialFiscal,
        regimenFiscal: patient.regimenFiscal,
        cpFiscal: patient.cpFiscal,
        usoCfdi: patient.usoCfdi,
      },
    },
  }
}

export async function getCobrosFacturables(patientId: string): Promise<CobroPendiente[]> {
  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)

  const cobros = await prisma.cobro.findMany({
    where: {
      facturado: false,
      cobradoAt: { gte: inicioMes },
      appointment: { patientId },
    },
    include: { appointment: { select: { scheduledAt: true } } },
    orderBy: { cobradoAt: 'desc' },
  })

  return cobros.map(c => {
    const tipoConfig = TIPOS_CONSULTA.find(t => t.value === c.tipoConsulta)
    return {
      id: c.id,
      appointmentId: c.appointmentId,
      tipoConsulta: c.tipoConsulta,
      tipoLabel: tipoConfig?.label ?? c.tipoConsulta,
      montoTotal: c.montoTotal,
      metodoPago: c.metodoPago,
      cobradoAt: c.cobradoAt.toISOString(),
      fecha: c.appointment.scheduledAt.toLocaleDateString('es-MX', {
        day: '2-digit', month: 'long', year: 'numeric',
        timeZone: 'America/Mexico_City',
      }),
    }
  })
}

export async function guardarDatosFiscales(
  patientId: string,
  datos: DatosFiscales,
): Promise<{ ok: boolean; error?: string }> {
  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i
  if (!rfcRegex.test(datos.rfc)) {
    return { ok: false, error: 'RFC inválido' }
  }
  if (!datos.razonSocial.trim()) {
    return { ok: false, error: 'Razón social requerida' }
  }
  if (!/^\d{5}$/.test(datos.cpFiscal)) {
    return { ok: false, error: 'Código postal fiscal inválido (5 dígitos)' }
  }

  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        rfc: datos.rfc.toUpperCase(),
        razonSocialFiscal: datos.razonSocial.trim(),
        regimenFiscal: datos.regimenFiscal,
        cpFiscal: datos.cpFiscal,
        usoCfdi: datos.usoCfdi,
      },
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al guardar datos fiscales' }
  }
}

export async function emitirCfdi(
  cobroId: string,
  patientId: string,
): Promise<{ ok: boolean; uuid?: string; pdfUrl?: string; error?: string }> {
  const [cobro, patient] = await Promise.all([
    prisma.cobro.findUnique({
      where: { id: cobroId },
      include: { appointment: { select: { scheduledAt: true, patientId: true } } },
    }),
    prisma.patient.findUnique({ where: { id: patientId } }),
  ])

  if (!cobro || cobro.appointment.patientId !== patientId) {
    return { ok: false, error: 'Cobro no encontrado' }
  }
  if (cobro.facturado) {
    return { ok: false, error: 'Este cobro ya fue facturado' }
  }
  if (!patient?.rfc || !patient.regimenFiscal || !patient.cpFiscal) {
    return { ok: false, error: 'Datos fiscales incompletos' }
  }

  const tipoConfig = TIPOS_CONSULTA.find(t => t.value === cobro.tipoConsulta)
  const descripcion = `Honorarios médicos — ${tipoConfig?.label ?? cobro.tipoConsulta} — ORL`

  const emailPaciente = patient.email ? decrypt(patient.email) : ''

  try {
    const cfdi = await generarCfdi(
      {
        rfc:           patient.rfc,
        razonSocial:   patient.razonSocialFiscal ?? `${patient.nombre} ${patient.apellidoPaterno}`,
        regimenFiscal: patient.regimenFiscal,
        cpFiscal:      patient.cpFiscal,
        usoCfdi:       patient.usoCfdi ?? 'D01',
      },
      { descripcion, montoTotal: cobro.montoTotal },
      cobro.metodoPago,
      emailPaciente,
    )

    await prisma.cobro.update({
      where: { id: cobroId },
      data: { facturado: true, cfdiUid: cfdi.uid, cfdiUuid: cfdi.uuid },
    })

    return { ok: true, uuid: cfdi.uuid, pdfUrl: cfdi.pdfUrl }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error al emitir CFDI' }
  }
}
