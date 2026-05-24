import nodemailer, { type Transporter } from 'nodemailer'
import type { getClinicConfigFromDB } from '@/lib/clinic-config'

type ClinicConfig = Awaited<ReturnType<typeof getClinicConfigFromDB>>

let _transport: Transporter | null = null

function getTransport(): Transporter {
  if (_transport) return _transport

  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  _transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 25),
    secure: Number(process.env.SMTP_PORT ?? 25) === 465,
    ...(smtpUser && smtpPass
      ? { auth: { user: smtpUser, pass: smtpPass } }
      : { ignoreTLS: true }),
  })

  return _transport
}

export function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Helpers de branding ─────────────────────────────────────────────────────

function sender(cfg: ClinicConfig): string {
  const from = process.env.SMTP_FROM ?? 'contacto@otorrinonet.com'
  return `"${cfg.clinicName}" <${from}>`
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.otorrinonet.com'
}

function clinicEmail(): string | null {
  return process.env.CLINIC_EMAIL ?? null
}

// ─── Layout HTML compartido ──────────────────────────────────────────────────

function emailLayout(content: string, cfg: ClinicConfig): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0369a1;padding:20px 24px;border-radius:8px 8px 0 0">
        <p style="color:#fff;font-weight:700;font-size:1.25em;margin:0">${esc(cfg.clinicName)}</p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
        ${content}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:0.75em;margin:0">
          ${esc(cfg.clinicName)}${cfg.clinicAddress ? ' — ' + esc(cfg.clinicAddress) : ''}
          ${cfg.clinicPhone ? ' · ' + esc(cfg.clinicPhone) : ''}
        </p>
      </div>
    </div>
  `.trim()
}

// ─── Restablecimiento de contraseña ─────────────────────────────────────────

export async function sendPasswordResetEmail(
  toEmail: string,
  toNombre: string,
  plainToken: string,
  cfg: ClinicConfig,
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const resetUrl = `${appUrl()}/reset-password?token=${plainToken}`

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${toNombre}" <${toEmail}>`,
    subject: `Restablecimiento de contraseña — ${cfg.clinicName}`,
    text: [
      `Estimado/a ${toNombre},`,
      '',
      'Recibimos una solicitud para restablecer su contraseña.',
      '',
      `Use el siguiente enlace (válido por 1 hora): ${resetUrl}`,
      '',
      'Si usted no realizó esta solicitud, ignore este correo.',
    ].join('\n'),
    html: emailLayout(`
      <p>Estimado/a <strong>${esc(toNombre)}</strong>,</p>
      <p>Recibimos una solicitud para restablecer su contraseña.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
          Restablecer contraseña
        </a>
      </p>
      <p style="color:#666;font-size:0.875em">Este enlace expira en <strong>1 hora</strong>.</p>
      <p style="color:#666;font-size:0.875em">Si el botón no funciona: <code>${esc(resetUrl)}</code></p>
      <p style="color:#999;font-size:0.75em">Si usted no realizó esta solicitud, ignore este correo.</p>
    `, cfg),
  })
}

// ─── Citas del portal ────────────────────────────────────────────────────────

export interface AppointmentEmailData {
  patientName: string
  patientEmail: string
  fecha: string        // "YYYY-MM-DD"
  hora: string         // "HH:MM"
  appointmentType: string
  actionToken: string
  motivo?: string | null
}

const APPOINTMENT_TYPE_LABEL: Record<string, string> = {
  primera_vez:  'Primera vez',
  subsecuente:  'Consulta de seguimiento',
  urgencia:     'Urgencia',
}

function formatDate(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export async function sendAppointmentConfirmationToPatient(
  data: AppointmentEmailData,
  cfg: ClinicConfig,
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const confirmUrl  = `${appUrl()}/cita/confirmar?token=${data.actionToken}`
  const cancelUrl   = `${appUrl()}/cita/cancelar?token=${data.actionToken}`
  const modifyUrl   = `${appUrl()}/cita/modificar?token=${data.actionToken}`
  const typeLabel   = APPOINTMENT_TYPE_LABEL[data.appointmentType] ?? data.appointmentType
  const dateStr     = formatDate(data.fecha)

  const content = `
    <p>Estimado/a <strong>${esc(data.patientName)}</strong>,</p>
    <p>Su solicitud de cita ha sido recibida. Los detalles son:</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600;width:40%">Tipo de consulta</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(typeLabel)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Fecha</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(dateStr)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Hora</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.hora)}</td></tr>
      ${cfg.clinicAddress ? `<tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Lugar</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(cfg.clinicAddress)}</td></tr>` : ''}
      ${data.motivo ? `<tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Motivo</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.motivo)}</td></tr>` : ''}
    </table>
    <p>Por favor confirme su asistencia o modifique la fecha si lo necesita:</p>
    <p>
      <a href="${confirmUrl}" style="display:inline-block;padding:10px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-right:8px;margin-bottom:8px">Confirmar cita</a>
      <a href="${modifyUrl}"  style="display:inline-block;padding:10px 20px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-right:8px;margin-bottom:8px">Modificar fecha</a>
      <a href="${cancelUrl}"  style="display:inline-block;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-bottom:8px">Cancelar cita</a>
    </p>
    ${cfg.clinicPhone ? `<p style="color:#6b7280;font-size:0.875em">Si tiene dudas llámenos al ${esc(cfg.clinicPhone)}.</p>` : ''}
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `Cita agendada — ${dateStr} a las ${data.hora}`,
    html: emailLayout(content, cfg),
    text: `Cita agendada: ${typeLabel} el ${dateStr} a las ${data.hora}.\nConfirmar: ${confirmUrl}\nModificar: ${modifyUrl}\nCancelar: ${cancelUrl}`,
  })
}

export async function sendAppointmentNotificationToDoctor(
  data: AppointmentEmailData,
  cfg: ClinicConfig,
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const notifEmail = clinicEmail()
  if (!notifEmail) return

  const typeLabel = APPOINTMENT_TYPE_LABEL[data.appointmentType] ?? data.appointmentType
  const dateStr   = formatDate(data.fecha)

  const content = `
    <p>Se ha recibido una nueva solicitud de cita a través del portal.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600;width:40%">Paciente</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.patientName)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Tipo</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(typeLabel)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Fecha</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(dateStr)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Hora</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.hora)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Email</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.patientEmail)}</td></tr>
      ${data.motivo ? `<tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Motivo</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.motivo)}</td></tr>` : ''}
    </table>
    <p style="color:#6b7280;font-size:0.875em">Revise su agenda en el sistema EHR para confirmar o reagendar.</p>
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${cfg.clinicName}" <${notifEmail}>`,
    subject: `Nueva cita portal — ${data.patientName} el ${dateStr}`,
    html: emailLayout(content, cfg),
    text: `Nueva cita portal: ${data.patientName}, ${typeLabel}, ${dateStr} ${data.hora}. Email: ${data.patientEmail}`,
  })
}

export async function sendAppointmentCancellation(
  data: Pick<AppointmentEmailData, 'patientName' | 'patientEmail' | 'fecha' | 'hora'>,
  cfg: ClinicConfig,
  cancelledBy: 'patient' | 'clinic',
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const dateStr = formatDate(data.fecha)
  const reason  = cancelledBy === 'clinic'
    ? 'El consultorio ha cancelado su cita. Puede agendar una nueva desde el portal.'
    : 'Su cita ha sido cancelada correctamente.'

  const content = `
    <p>Estimado/a <strong>${esc(data.patientName)}</strong>,</p>
    <p>${reason}</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#fef2f2;border:1px solid #e5e7eb;font-weight:600;width:40%">Fecha cancelada</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(dateStr)}</td></tr>
      <tr><td style="padding:8px 12px;background:#fef2f2;border:1px solid #e5e7eb;font-weight:600">Hora</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.hora)}</td></tr>
    </table>
    <p>
      <a href="${appUrl()}/agendar" style="display:inline-block;padding:10px 20px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Agendar nueva cita</a>
    </p>
    ${cfg.clinicPhone ? `<p style="color:#6b7280;font-size:0.875em">Si tiene preguntas contáctenos al ${esc(cfg.clinicPhone)}.</p>` : ''}
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `Cita cancelada — ${cfg.clinicName}`,
    html: emailLayout(content, cfg),
    text: `${reason} Cita cancelada: ${dateStr} ${data.hora}.`,
  })
}

export async function sendAppointmentReschedule(
  data: AppointmentEmailData,
  cfg: ClinicConfig,
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const confirmUrl = `${appUrl()}/cita/confirmar?token=${data.actionToken}`
  const cancelUrl  = `${appUrl()}/cita/cancelar?token=${data.actionToken}`
  const modifyUrl  = `${appUrl()}/cita/modificar?token=${data.actionToken}`
  const typeLabel  = APPOINTMENT_TYPE_LABEL[data.appointmentType] ?? data.appointmentType
  const dateStr    = formatDate(data.fecha)

  const content = `
    <p>Estimado/a <strong>${esc(data.patientName)}</strong>,</p>
    <p>Su cita ha sido <strong>reagendada</strong>. Los nuevos detalles son:</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600;width:40%">Tipo</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(typeLabel)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Nueva fecha</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(dateStr)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Nueva hora</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.hora)}</td></tr>
      ${cfg.clinicAddress ? `<tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Lugar</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(cfg.clinicAddress)}</td></tr>` : ''}
    </table>
    <p>
      <a href="${confirmUrl}" style="display:inline-block;padding:10px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-right:8px;margin-bottom:8px">Confirmar nueva cita</a>
      <a href="${modifyUrl}"  style="display:inline-block;padding:10px 20px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-right:8px;margin-bottom:8px">Modificar fecha</a>
      <a href="${cancelUrl}"  style="display:inline-block;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-bottom:8px">Cancelar</a>
    </p>
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `Cita reagendada — ${dateStr} a las ${data.hora}`,
    html: emailLayout(content, cfg),
    text: `Cita reagendada: ${typeLabel} el ${dateStr} a las ${data.hora}.\nConfirmar: ${confirmUrl}\nCancelar: ${cancelUrl}`,
  })
}

// ─── Email NPS post-consulta ─────────────────────────────────────────────────

const PLACE_ID = 'ChIJ0R5OAqT5BIYR1jEuvyIO4M4'
const REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`

export interface NpsEmailData {
  patientName: string
  patientEmail: string
  whatsapp?: string
}

export async function sendNpsEmail(data: NpsEmailData, cfg: ClinicConfig): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const waText = encodeURIComponent(`Hola Dr. Viveros, quería compartirle mi experiencia de la consulta.`)
  const waLink = data.whatsapp ? `https://wa.me/${data.whatsapp.replace(/\D/g, '')}?text=${waText}` : null

  const content = `
    <p>Estimado/a <strong>${esc(data.patientName)}</strong>,</p>
    <p>Esperamos que su consulta haya sido de su agrado. Su opinión nos ayuda a mejorar y orienta a otros pacientes que buscan atención especializada.</p>
    <p>¿Nos regalaría un minuto para dejar su reseña?</p>
    <p style="margin:24px 0">
      <a href="${REVIEW_URL}" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:1em">
        ★ Dejar reseña en Google
      </a>
    </p>
    ${waLink ? `
    <p>También puede compartir su experiencia directamente por WhatsApp:</p>
    <p>
      <a href="${waLink}" style="display:inline-block;padding:10px 20px;background:#25d366;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
        Enviar comentario por WhatsApp
      </a>
    </p>
    ` : ''}
    <p style="color:#9ca3af;font-size:0.8em;margin-top:24px">Si ya dejó su reseña, muchas gracias. Puede ignorar este correo.</p>
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `¿Cómo fue su consulta? — ${cfg.clinicName}`,
    html: emailLayout(content, cfg),
    text: [
      `Estimado/a ${data.patientName},`,
      '',
      'Esperamos que su consulta haya sido de su agrado.',
      '',
      `Deje su reseña en Google: ${REVIEW_URL}`,
      waLink ? `Comentario por WhatsApp: ${waLink}` : '',
    ].filter(Boolean).join('\n'),
  })
}

// ─── Recordatorio 24 h antes ────────────────────────────────────────────────

export interface ReminderEmailData {
  patientName: string
  patientEmail: string
  fecha: string
  hora: string
  appointmentType: string
  actionToken: string
}

export async function sendReminderEmail(data: ReminderEmailData, cfg: ClinicConfig): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const confirmUrl = `${appUrl()}/cita/confirmar?token=${data.actionToken}`
  const cancelUrl  = `${appUrl()}/cita/cancelar?token=${data.actionToken}`
  const modifyUrl  = `${appUrl()}/cita/modificar?token=${data.actionToken}`
  const typeLabel  = APPOINTMENT_TYPE_LABEL[data.appointmentType] ?? data.appointmentType
  const dateStr    = formatDate(data.fecha)

  const content = `
    <p>Estimado/a <strong>${esc(data.patientName)}</strong>,</p>
    <p>Le recordamos que mañana tiene una cita programada en ${esc(cfg.clinicName)}.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600;width:40%">Tipo</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(typeLabel)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Fecha</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(dateStr)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Hora</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.hora)}</td></tr>
      ${cfg.clinicAddress ? `<tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Lugar</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(cfg.clinicAddress)}</td></tr>` : ''}
    </table>
    <p>
      <a href="${confirmUrl}" style="display:inline-block;padding:10px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-right:8px;margin-bottom:8px">Confirmar asistencia</a>
      <a href="${modifyUrl}"  style="display:inline-block;padding:10px 20px;background:#0369a1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-right:8px;margin-bottom:8px">Cambiar fecha</a>
      <a href="${cancelUrl}"  style="display:inline-block;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-bottom:8px">Cancelar cita</a>
    </p>
    ${cfg.clinicPhone ? `<p style="color:#6b7280;font-size:0.875em">Si tiene dudas llámenos al ${esc(cfg.clinicPhone)}.</p>` : ''}
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `Recordatorio de cita mañana — ${data.hora} — ${cfg.clinicName}`,
    html: emailLayout(content, cfg),
    text: `Recordatorio: ${typeLabel} mañana ${dateStr} a las ${data.hora}.\nConfirmar: ${confirmUrl}\nCambiar: ${modifyUrl}\nCancelar: ${cancelUrl}`,
  })
}

// ─── Formulario de contacto ───────────────────────────────────────────────────

export interface ContactEmailData {
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
}

export async function sendContactNotification(
  data: ContactEmailData,
  cfg: ClinicConfig,
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const notifEmail = clinicEmail()
  if (!notifEmail) return

  const content = `
    <p>Ha recibido un nuevo mensaje de contacto a través del portal.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600;width:30%">Nombre</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.name)}</td></tr>
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Correo</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.email)}</td></tr>
      ${data.phone ? `<tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Teléfono</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.phone)}</td></tr>` : ''}
      <tr><td style="padding:8px 12px;background:#f0f9ff;border:1px solid #e5e7eb;font-weight:600">Asunto</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${esc(data.subject)}</td></tr>
    </table>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:16px 0;white-space:pre-wrap">${esc(data.message)}</div>
    <p style="color:#6b7280;font-size:0.875em">Responda directamente a ${esc(data.email)}.</p>
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${cfg.clinicName}" <${notifEmail}>`,
    replyTo: `"${data.name}" <${data.email}>`,
    subject: `Nuevo mensaje: ${data.subject}`,
    html: emailLayout(content, cfg),
    text: `Nuevo mensaje de ${data.name} (${data.email}):\n\nAsunto: ${data.subject}\n\n${data.message}`,
  })
}

// ─── Email de confirmación de compra ──────────────────────────────────────────

export async function sendOrderTicket(params: {
  order: {
    id: string
    compradorNombre: string
    compradorEmail: string
    shippingChoice: 'pickup' | 'domicilio'
    subtotal: number      // centavos
    costoEnvio: number    // centavos
    total: number         // centavos
    direccionCalle?: string | null
    direccionNumero?: string | null
    direccionColonia?: string | null
    direccionMunicipio?: string | null
    direccionEstado?: string | null
    direccionCP?: string | null
  }
  items: {
    nombreSnapshot: string
    cantidad: number
    precioUnitario: number  // centavos
    subtotal: number        // centavos
  }[]
  pdfBuffer?: Buffer        // para Fase 3 CFDI; ignorar por ahora
  cfg: ClinicConfig
}): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  const itemsHtml = params.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${esc(item.nombreSnapshot)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.cantidad}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${formatCurrency(item.precioUnitario)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('')

  const shippingInfo = params.order.shippingChoice === 'pickup'
    ? `<p><strong>Método de entrega:</strong> Recoger en consultorio</p>
       <p>Puedes recoger tu pedido en el consultorio del Dr. Viveros en su próxima visita o llamando al consultorio.</p>`
    : `<p><strong>Método de entrega:</strong> Envío a domicilio</p>
       <p><strong>Dirección:</strong> ${esc(params.order.direccionCalle)} ${esc(params.order.direccionNumero)}, ${esc(params.order.direccionColonia)}, ${esc(params.order.direccionMunicipio)}, ${esc(params.order.direccionEstado)}, CP ${esc(params.order.direccionCP)}</p>
       <p>Nos pondremos en contacto contigo para coordinar la entrega.</p>`

  const content = `
    <p>Hola <strong>${esc(params.order.compradorNombre)}</strong>,</p>
    <p>Gracias por tu compra. Hemos recibido tu pedido con éxito.</p>

    <h3 style="margin-top:24px">Detalles del pedido #${params.order.id.slice(-8).toUpperCase()}</h3>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.875em">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb">Producto</th>
          <th style="padding:8px;text-align:center;border-bottom:2px solid #e5e7eb">Cant.</th>
          <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb">Precio</th>
          <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:8px;text-align:right;font-weight:600">Subtotal</td>
          <td style="padding:8px;text-align:right">${formatCurrency(params.order.subtotal)}</td>
        </tr>
        ${params.order.costoEnvio > 0 ? `
        <tr>
          <td colspan="3" style="padding:8px;text-align:right;font-weight:600">Envío</td>
          <td style="padding:8px;text-align:right">${formatCurrency(params.order.costoEnvio)}</td>
        </tr>` : ''}
        <tr>
          <td colspan="3" style="padding:8px;text-align:right;font-weight:700;font-size:1.1em">Total</td>
          <td style="padding:8px;text-align:right;font-weight:700;font-size:1.1em;color:#0369a1">${formatCurrency(params.order.total)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="background:#f0f9ff;padding:16px;border-radius:8px;margin-top:24px">
      ${shippingInfo}
    </div>

    <p style="margin-top:24px;font-size:0.875em;color:#6b7280">Si tienes alguna duda sobre tu pedido, por favor contáctanos.</p>
  `

  await getTransport().sendMail({
    from: sender(params.cfg),
    to: `"${params.order.compradorNombre}" <${params.order.compradorEmail}>`,
    subject: `Confirmación de pedido #${params.order.id.slice(-8).toUpperCase()} — ${params.cfg.clinicName}`,
    html: emailLayout(content, params.cfg),
    text: `Hola ${params.order.compradorNombre}, gracias por tu compra. Pedido #${params.order.id.slice(-8).toUpperCase()}, Total: ${formatCurrency(params.order.total)}`,
  })
}
