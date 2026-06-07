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

// ─── Layout HTML compartido (Design System OtorrinoNet) ─────────────────────

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap">`

const LOGO_URL = 'https://www.otorrinonet.com/assets/logo-otorrinonet-white.svg'

interface EmailLayoutOptions {
  headerBg?: string
  iconChip?: string  // HTML del ícono dentro del chip superior
}

function emailLayout(content: string, cfg: ClinicConfig, opts: EmailLayoutOptions = {}): string {
  const headerBg = opts.headerBg ?? '#0284c7'
  const addr = cfg.clinicAddress ? esc(cfg.clinicAddress) : 'Chosica 730, Col. Lindavista, GAM, CDMX'
  const phone = cfg.clinicPhone ? esc(cfg.clinicPhone) : ''
  const url = appUrl()

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${FONTS}</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);">
  <!-- Header -->
  <tr><td style="background:${headerBg};padding:22px 28px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
      <td style="width:52px;padding-right:12px;vertical-align:middle;">
        <img src="${LOGO_URL}" alt="OtorrinoNet" height="44" style="display:block;height:44px;width:auto;">
      </td>
      <td style="vertical-align:middle;">
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:700;color:rgba(255,255,255,.92);line-height:1.2;">${esc(cfg.doctorName)}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.65);margin-top:2px;">Otorrinolaringólogo &amp; Cirugía de Cabeza y Cuello · CDMX</div>
      </td>
    </tr></table>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:28px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#1e293b;padding:20px 28px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.8;">
      ${esc(cfg.doctorName)}${cfg.doctorLicense ? ` &nbsp;·&nbsp; Céd. Prof. ${esc(cfg.doctorLicense)}` : ''}<br>
      ${addr}${phone ? ` &nbsp;·&nbsp; Tel. ${phone}` : ''}<br>
      <a href="${url}" style="color:#7dd3fc;text-decoration:none;">${url.replace(/^https?:\/\//, '')}</a>
      &nbsp;·&nbsp; <a href="${url}/privacidad" style="color:#7dd3fc;text-decoration:none;">Aviso de privacidad</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`.trim()
}

// ─── Ícono SVG check ─────────────────────────────────────────────────────────
const SVG_CHECK = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
const SVG_CLOCK = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`
const SVG_X     = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`

function infoGrid(rows: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;border-radius:8px;padding:4px 0;margin-bottom:20px;">
    ${rows.map(([k, v]) => `<tr>
      <td style="padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap;vertical-align:top;">${k}</td>
      <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#0f172a;">${v}</td>
    </tr>`).join('')}
  </table>`
}

function ctaButton(label: string, href: string, color = '#0284c7'): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;font-size:14px;font-weight:600;padding:12px 26px;border-radius:8px;text-decoration:none;">${label}</a>`
}

function ctaSecondary(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#fff;color:#475569;font-size:13px;font-weight:600;padding:11px 22px;border-radius:8px;text-decoration:none;border:1px solid #e2e8f0;">${label}</a>`
}

function iconChip(icon: string, bg: string, color: string): string {
  return `<div style="width:52px;height:52px;border-radius:14px;background:${bg};display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;color:${color};">${icon}</div>`
}

function emailTitle(title: string): string {
  return `<div style="font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:700;color:#0f172a;line-height:1.2;margin-bottom:8px;">${title}</div>`
}

function emailLead(html: string): string {
  return `<p style="font-size:14px;color:#475569;line-height:1.65;margin:0 0 20px;">${html}</p>`
}

function emailDivider(): string {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">`
}

function emailNote(html: string): string {
  return `<p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;">${html}</p>`
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

  const infoRows: [string, string][] = [
    ['Servicio', esc(typeLabel)],
    ['Fecha', esc(dateStr)],
    ['Hora', `<span style="font-family:'IBM Plex Mono',monospace;">${esc(data.hora)} hrs</span>`],
    ...(cfg.clinicAddress ? [['Consultorio', esc(cfg.clinicAddress)] as [string, string]] : []),
    ...(data.motivo ? [['Motivo', esc(data.motivo)] as [string, string]] : []),
  ]

  const content = `
    ${iconChip(`<span style="color:#047857">${SVG_CHECK}</span>`, '#ecfdf5', '#047857')}
    ${emailTitle('¡Tu cita está confirmada!')}
    ${emailLead(`Hola <b>${esc(data.patientName)}</b>, tu cita ha sido registrada. Aquí tienes los detalles:`)}
    ${infoGrid(infoRows)}
    <p style="margin:0 0 12px;">
      ${ctaButton('Confirmar asistencia', confirmUrl, '#047857')}
      &nbsp;
      ${ctaSecondary('Reagendar', modifyUrl)}
      &nbsp;
      ${ctaSecondary('Cancelar', cancelUrl)}
    </p>
    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin:20px 0 10px;">Qué llevar</p>
    <ul style="list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:8px;">
      <li style="font-size:13px;color:#475569;">✓ &nbsp;Identificación oficial vigente</li>
      <li style="font-size:13px;color:#475569;">✓ &nbsp;Estudios o resultados previos (si los tienes)</li>
      <li style="font-size:13px;color:#475569;">✓ &nbsp;Lista de medicamentos actuales</li>
    </ul>
    ${emailDivider()}
    ${emailNote(`¿Necesitas cancelar o cambiar tu cita?${cfg.clinicPhone ? ` Llámanos al <b style="color:#334155">${esc(cfg.clinicPhone)}</b> con al menos 2 horas de anticipación o` : ''} hazlo desde <a href="${appUrl()}" style="color:#0284c7;">otorrinonet.mx</a>.`)}
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `✓ Tu cita está confirmada — ${dateStr} a las ${data.hora}`,
    html: emailLayout(content, cfg),
    text: `Cita confirmada: ${typeLabel} el ${dateStr} a las ${data.hora}.\nConfirmar: ${confirmUrl}\nModificar: ${modifyUrl}\nCancelar: ${cancelUrl}`,
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

  const motivo = cancelledBy === 'clinic' ? 'Reagendada por el consultorio' : 'Cancelada a petición del paciente'

  const content = `
    ${iconChip(`<span style="color:#e11d48">${SVG_X}</span>`, '#fff1f2', '#e11d48')}
    ${emailTitle('Tu cita fue cancelada')}
    ${emailLead(`Hola <b>${esc(data.patientName)}</b>, lamentamos informarte que tu cita del <b>${esc(dateStr)} a las ${esc(data.hora)} hrs</b> ha sido cancelada.`)}
    ${infoGrid([
      ['Motivo', motivo],
      ['Fecha cancelada', `${esc(dateStr)} · ${esc(data.hora)} hrs`],
    ])}
    ${emailLead('Puedes agendar una nueva cita de inmediato — tu historial clínico se conserva.')}
    <p style="margin:0 0 20px;">${ctaButton('Reagendar cita', `${appUrl()}/agendar`)}</p>
    ${emailDivider()}
    ${emailNote(`Si tienes dudas o necesitas atención urgente${cfg.clinicPhone ? ` llámanos al <b style="color:#334155">${esc(cfg.clinicPhone)}</b>` : ''}. Lamentamos los inconvenientes causados.`)}
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `Tu cita del ${dateStr} ha sido cancelada`,
    html: emailLayout(content, cfg, { headerBg: '#334155' }),
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

  const infoRowsR: [string, string][] = [
    ['Servicio', esc(typeLabel)],
    ['Nueva fecha', esc(dateStr)],
    ['Nueva hora', `<span style="font-family:'IBM Plex Mono',monospace;">${esc(data.hora)} hrs</span>`],
    ...(cfg.clinicAddress ? [['Lugar', esc(cfg.clinicAddress)] as [string, string]] : []),
  ]

  const content = `
    ${iconChip(`<span style="color:#047857">${SVG_CHECK}</span>`, '#ecfdf5', '#047857')}
    ${emailTitle('Tu cita fue reagendada')}
    ${emailLead(`Hola <b>${esc(data.patientName)}</b>, tu cita ha sido <b>reagendada</b>. Aquí tienes los nuevos detalles:`)}
    ${infoGrid(infoRowsR)}
    <p style="margin:0 0 20px;">
      ${ctaButton('Confirmar nueva cita', confirmUrl, '#047857')}
      &nbsp;
      ${ctaSecondary('Modificar fecha', modifyUrl)}
      &nbsp;
      ${ctaSecondary('Cancelar', cancelUrl)}
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
    ${iconChip('<span style="color:#d97706;font-size:22px;">★</span>', '#fffbeb', '#d97706')}
    ${emailTitle('¿Cómo fue su consulta?')}
    ${emailLead(`Hola <b>${esc(data.patientName)}</b>, esperamos que su consulta haya sido de su agrado. Su opinión nos ayuda a mejorar y orienta a otros pacientes que buscan atención especializada.`)}
    <p style="margin:0 0 20px;">
      ${ctaButton('★ Dejar reseña en Google', REVIEW_URL, '#d97706')}
      ${waLink ? `&nbsp;${ctaSecondary('Comentar por WhatsApp', waLink)}` : ''}
    </p>
    ${emailDivider()}
    ${emailNote('Si ya dejó su reseña, muchas gracias. Puede ignorar este correo.')}
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

  const infoRowsRem: [string, string][] = [
    ['Servicio', esc(typeLabel)],
    ['Hora', `<span style="font-family:'IBM Plex Mono',monospace;">${esc(data.hora)} hrs</span>`],
    ...(cfg.clinicAddress ? [['Lugar', esc(cfg.clinicAddress)] as [string, string]] : []),
  ]

  const content = `
    ${iconChip(`<span style="color:#d97706">${SVG_CLOCK}</span>`, '#fffbeb', '#d97706')}
    ${emailTitle('Tu cita es mañana')}
    ${emailLead(`Hola <b>${esc(data.patientName)}</b>, te recordamos que tienes una cita programada <b>mañana, ${esc(dateStr)}</b>.`)}
    ${infoGrid(infoRowsRem)}
    <p style="margin:0 0 20px;">
      ${ctaButton('Confirmar asistencia', confirmUrl)}
      &nbsp;
      ${ctaSecondary('Reagendar', modifyUrl)}
      &nbsp;
      ${ctaSecondary('Cancelar', cancelUrl)}
    </p>
    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin:0 0 10px;">Recomendaciones</p>
    <ul style="list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:6px;">
      <li style="font-size:13px;color:#475569;">✓ &nbsp;Llega 10 minutos antes para tu registro</li>
      <li style="font-size:13px;color:#475569;">✓ &nbsp;Trae identificación oficial y estudios previos</li>
      <li style="font-size:13px;color:#475569;">✓ &nbsp;Si presentas fiebre o síntomas graves, notifícanos antes</li>
    </ul>
    ${emailDivider()}
    ${emailNote(`Para cancelar sin penalización notifícanos con al menos 2 horas de anticipación${cfg.clinicPhone ? ` al <b style="color:#334155">${esc(cfg.clinicPhone)}</b>` : ''} o desde <a href="${appUrl()}" style="color:#0284c7;">otorrinonet.mx</a>.`)}
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `Recordatorio: tu cita es mañana a las ${data.hora} hrs`,
    html: emailLayout(content, cfg, { headerBg: '#0369a1' }),
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

// ─── Receta firmada ───────────────────────────────────────────────────────────

export interface SignedPrescriptionEmailData {
  patientName: string
  patientEmail: string
  doctorName: string
  fecha: string
  prescriptionId: string
  firmaHash?: string | null
  diagnostico?: string | null
  medications: {
    name: string
    brandName?: string
    dose: string
    frequency: string
    duration?: string
    route?: string
  }[]
}

export async function sendSignedPrescriptionEmail(
  data: SignedPrescriptionEmailData,
  cfg: ClinicConfig,
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const verifyUrl = `${appUrl()}/verificar/receta/${data.prescriptionId}${data.firmaHash ? `?hash=${data.firmaHash}` : ''}`
  const folio = `rx-${data.prescriptionId.slice(-8)}`
  const dateStr = formatDate(data.fecha)

  const medsHtml = data.medications.map(m => `
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:10px;">
      <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:700;color:#0f172a;">
        ${esc(m.name)}${m.brandName ? ` <span style="font-size:12px;font-style:italic;color:#94a3b8;">(${esc(m.brandName)})</span>` : ''}
      </div>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
        ${m.dose ? `<span style="background:#f1f5f9;border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;color:#475569;">${esc(m.dose)}</span>` : ''}
        ${m.frequency ? `<span style="background:#f1f5f9;border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;color:#475569;">${esc(m.frequency)}</span>` : ''}
        ${m.duration ? `<span style="background:#f1f5f9;border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;color:#475569;">${esc(m.duration)}</span>` : ''}
        ${m.route ? `<span style="background:#f1f5f9;border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;color:#475569;">${esc(m.route)}</span>` : ''}
      </div>
    </div>`).join('')

  const infoRowsRx: [string, string][] = [
    ...(data.diagnostico ? [['Diagnóstico', esc(data.diagnostico)] as [string, string]] : []),
    ['Médico', `${esc(data.doctorName)}${cfg.doctorLicense ? ` · Céd. ${esc(cfg.doctorLicense)}` : ''}`],
    ['Folio', `<span style="font-family:'IBM Plex Mono',monospace;">${esc(folio)}</span>`],
    ['Firmada', `<span style="font-family:'IBM Plex Mono',monospace;">${esc(dateStr)}</span>`],
  ]

  const content = `
    ${iconChip('<span style="font-family:DM Sans,Arial,sans-serif;font-size:26px;font-weight:700;color:#047857;line-height:1;">℞</span>', '#ecfdf5', '#047857')}
    ${emailTitle('Tu receta está lista')}
    ${emailLead(`Hola <b>${esc(data.patientName)}</b>, el Dr. Viveros ha firmado tu receta médica del <b>${dateStr}</b>. Puedes descargarla a continuación:`)}
    ${infoGrid(infoRowsRx)}
    <p style="margin:0 0 20px;">${ctaButton('Descargar receta PDF', verifyUrl, '#047857')}</p>
    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin:0 0 10px;">Medicamentos prescritos</p>
    ${medsHtml}
    ${emailDivider()}
    ${emailNote(`Este documento tiene validez legal con firma electrónica SHA-256 conforme a la NOM-004-SSA3-2012. El enlace de descarga estará disponible por 30 días. ¿Tienes dudas sobre tu medicación? <a href="mailto:${cfg.clinicEmail || 'contacto@otorrinonet.com'}" style="color:#0284c7;">Escríbenos</a>.`)}
  `

  await getTransport().sendMail({
    from: sender(cfg),
    to: `"${data.patientName}" <${data.patientEmail}>`,
    subject: `℞ Tu receta médica está lista — ${esc(cfg.doctorName)}`,
    html: emailLayout(content, cfg),
    text: `Tu receta del ${dateStr} está lista. Descárgala en: ${verifyUrl}`,
  })
}
