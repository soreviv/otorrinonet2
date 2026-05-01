import type { LabOrderRecord } from '@/app/actions/lab-orders'

export interface LabOrderPrintData {
  order: LabOrderRecord
  patientName: string
  tipoEstudio: 'laboratorio' | 'gabinete'
  clinic: {
    clinicName: string
    clinicAddress: string
    clinicPhone: string
    clinicCofepris?: string
    doctorName: string
    doctorLicense: string
    doctorSpecialtyLicense: string
    doctorUniversity: string
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatDateLong(iso: string): string {
  return new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function printLabOrder(data: LabOrderPrintData): void {
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return

  const { order, clinic, tipoEstudio, patientName } = data
  const titulo = tipoEstudio === 'laboratorio' ? 'Solicitud de Laboratorio' : 'Solicitud de Estudios de Gabinete'
  const estudiosHtml = order.estudios.map((e, i) => `
    <div class="estudio-row">
      <span class="estudio-num">${i + 1}</span>
      <span class="estudio-nombre">${esc(e)}</span>
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${titulo} — ${esc(patientName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; }
  @page { size: letter; margin: 15mm; }

  .header { background: #0369a1; color: #fff; padding: 14px 18px; border-radius: 4px 4px 0 0; }
  .header h1 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .header .sub { font-size: 10px; opacity: .85; display: flex; gap: 16px; flex-wrap: wrap; }

  .doc-strip { background: #e0f2fe; padding: 10px 18px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #bae6fd; }
  .doc-strip .name { font-weight: 700; font-size: 13px; color: #0c4a6e; }
  .doc-strip .uni { font-size: 10px; color: #64748b; margin-top: 2px; }
  .doc-strip .cedulas { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .ced { font-family: monospace; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
  .ced.general { background: #f1f5f9; color: #475569; }
  .ced.especialidad { background: #dbeafe; color: #1e40af; }

  .patient-row { display: flex; justify-content: space-between; padding: 10px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  .patient-row .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; }
  .patient-row .val { font-weight: 600; font-size: 13px; color: #0f172a; margin-top: 2px; }

  .urgente-banner { background: #fef2f2; border-left: 4px solid #dc2626; padding: 8px 18px; color: #b91c1c; font-weight: 700; font-size: 12px; }

  .content { padding: 14px 18px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #0369a1; margin: 14px 0 8px; border-bottom: 1px solid #bae6fd; padding-bottom: 4px; }
  .estudio-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f1f5f9; }
  .estudio-num { width: 22px; height: 22px; border-radius: 50%; background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .estudio-nombre { font-size: 12px; color: #0f172a; }

  .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; }
  .info-box .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
  .info-box .val { font-size: 12px; color: #1e293b; }
  .badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; }
  .badge.warn { background: #fef9c3; color: #a16207; }

  .sig-section { padding: 14px 18px; display: flex; justify-content: flex-end; }
  .sig-box { border-top: 1px solid #94a3b8; padding-top: 8px; width: 200px; text-align: center; }
  .sig-box .sig-name { font-weight: 700; font-size: 11px; color: #0c4a6e; }
  .sig-box .sig-sub { font-size: 9px; color: #64748b; margin-top: 2px; }

  .footer { padding: 8px 18px; background: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; text-align: center; border-radius: 0 0 4px 4px; }

  @media print {
    body { background: #fff; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${esc(clinic.clinicName)}</h1>
    <div class="sub">
      ${clinic.clinicAddress ? `<span>📍 ${esc(clinic.clinicAddress)}</span>` : ''}
      ${clinic.clinicPhone ? `<span>📞 ${esc(clinic.clinicPhone)}</span>` : ''}
      ${clinic.clinicCofepris ? `<span>COFEPRIS AF: ${esc(clinic.clinicCofepris)}</span>` : ''}
    </div>
  </div>

  <div class="doc-strip">
    <div>
      <div class="name">${esc(clinic.doctorName)}</div>
      ${clinic.doctorUniversity ? `<div class="uni">${esc(clinic.doctorUniversity)}</div>` : ''}
    </div>
    <div class="cedulas">
      ${clinic.doctorLicense ? `<span class="ced general">Céd. Med. ${esc(clinic.doctorLicense)}</span>` : ''}
      ${clinic.doctorSpecialtyLicense ? `<span class="ced especialidad">Céd. Esp. ${esc(clinic.doctorSpecialtyLicense)}</span>` : ''}
    </div>
  </div>

  <div class="patient-row">
    <div>
      <div class="lbl">Paciente</div>
      <div class="val">${esc(patientName)}</div>
    </div>
    <div style="text-align:right">
      <div class="lbl">Fecha de solicitud</div>
      <div class="val">${formatDateLong(order.createdAt.split('T')[0])}</div>
    </div>
  </div>

  ${order.urgente ? '<div class="urgente-banner">⚠ URGENTE — Procesamiento inmediato</div>' : ''}

  <div class="content">
    <div class="section-title">${titulo}</div>
    ${estudiosHtml}

    <div class="info-row">
      ${order.diagnosticoPresuntivo ? `
      <div class="info-box">
        <div class="lbl">Diagnóstico presuntivo</div>
        <div class="val">${esc(order.diagnosticoPresuntivo)}</div>
      </div>` : ''}
      <div class="info-box">
        <div class="lbl">Condiciones especiales</div>
        <div class="val">
          ${order.ayuno ? '<span class="badge warn">⏱ Ayuno de 8 h</span>' : '<span class="badge">Sin ayuno</span>'}
        </div>
      </div>
    </div>

    ${order.indicacionesClinicas ? `
    <div class="info-box" style="margin-top:12px">
      <div class="lbl">Indicaciones clínicas</div>
      <div class="val">${esc(order.indicacionesClinicas)}</div>
    </div>` : ''}
  </div>

  <div class="sig-section">
    <div class="sig-box">
      <div class="sig-name">${esc(clinic.doctorName)}</div>
      <div class="sig-sub">Firma y sello</div>
    </div>
  </div>

  <div class="footer">
    Documento válido únicamente con firma y sello del médico solicitante · Expedido conforme a NOM-004-SSA3-2012
  </div>

<script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

  win.document.write(html)
  win.document.close()
}
