import type { EvolutionNote } from '@/lib/notas-types'
import type { CLINIC_CONFIG } from '@/lib/clinic-config'

type ClinicConfig = typeof CLINIC_CONFIG

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmtLong(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function fmtDate(iso: string): string {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function soapRow(label: string, value: string): string {
  if (!value) return ''
  return `
    <div class="soap-row">
      <div class="soap-label">${esc(label)}</div>
      <div class="soap-value">${esc(value).replace(/\n/g, '<br/>')}</div>
    </div>`
}

export function printEvolutionNote(note: EvolutionNote, cfg: ClinicConfig): void {
  const win = window.open('', '_blank', 'width=820,height=1000')
  if (!win) return

  const dxHtml = note.diagnosticos.length
    ? `<div class="dx-wrap">${note.diagnosticos.map(d =>
        `<span class="dx-badge"><span class="dx-code">${esc(d.codigo)}</span><span class="dx-desc">${esc(d.descripcion)}</span></span>`
      ).join('')}</div>`
    : ''

  const adendaHtml = note.addendums.length
    ? `<div class="section">
        <div class="section-title">Adendums</div>
        ${note.addendums.map((a, i) => `
          <div class="addendum">
            <div class="addendum-header">Adendum #${i + 1} · ${esc(a.authorName)} · ${fmtLong(a.fecha)}</div>
            <div class="addendum-body">${esc(a.contenido).replace(/\n/g, '<br/>')}</div>
            ${a.firmaHash ? `<div class="hash">SHA-256: ${esc(a.firmaHash)}</div>` : ''}
          </div>`).join('')}
      </div>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Nota de evolución — ${esc(note.patientName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; }
  @page { size: letter; margin: 14mm; }

  /* Header */
  .header { background: #0369a1; color: #fff; padding: 13px 18px; border-radius: 4px 4px 0 0; display: flex; align-items: center; gap: 14px; }
  .header .logo { width: 54px; height: 54px; background: #fff; border-radius: 8px; padding: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .header .logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .header h1 { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .header .sub { font-size: 10px; opacity: .85; display: flex; gap: 14px; flex-wrap: wrap; }

  /* Doctor strip */
  .doc-strip { background: #e0f2fe; padding: 9px 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 1px solid #bae6fd; }
  .doc-strip .doc-info { display: flex; align-items: center; gap: 10px; }
  .doc-strip .uni-logo { width: 36px; height: 36px; background: #fff; border-radius: 6px; padding: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #bae6fd; }
  .doc-strip .uni-logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .doc-strip .name { font-weight: 700; font-size: 12px; color: #0c4a6e; }
  .doc-strip .uni { font-size: 10px; color: #64748b; margin-top: 1px; }
  .doc-strip .cedulas { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .ced { font-family: monospace; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
  .ced.gen { background: #f1f5f9; color: #475569; }
  .ced.esp { background: #dbeafe; color: #1e40af; }

  /* Document title */
  .doc-title { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; }
  .doc-title .title { font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -.01em; }
  .doc-title .doc-type { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #0369a1; background: #e0f2fe; padding: 3px 8px; border-radius: 20px; }

  /* Patient row */
  .patient-row { display: flex; justify-content: space-between; padding: 9px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; gap: 12px; }
  .patient-row .field { flex: 1; min-width: 0; }
  .patient-row .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; }
  .patient-row .val { font-weight: 600; font-size: 13px; color: #0f172a; margin-top: 2px; }

  /* Sections */
  .section { padding: 12px 18px; border-bottom: 1px solid #f1f5f9; }
  .section-title { font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }

  /* SOAP rows */
  .soap-row { margin-bottom: 10px; }
  .soap-row:last-child { margin-bottom: 0; }
  .soap-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #0369a1; margin-bottom: 3px; }
  .soap-value { font-size: 12px; color: #1e293b; line-height: 1.5; background: #f8fafc; border-left: 2px solid #bae6fd; padding: 5px 8px; border-radius: 0 4px 4px 0; }

  /* Diagnosticos */
  .dx-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
  .dx-badge { display: inline-flex; align-items: center; gap: 5px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 3px 8px; }
  .dx-code { font-family: monospace; font-size: 11px; font-weight: 700; color: #1d4ed8; }
  .dx-desc { font-size: 11px; color: #1e40af; }

  /* Signed banner */
  .signed-banner { margin: 0 18px 0; padding: 7px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 10px; color: #166534; }
  .signed-banner strong { font-weight: 700; }
  .hash { font-family: monospace; font-size: 8.5px; color: #64748b; margin-top: 3px; word-break: break-all; }

  /* Addendums */
  .addendum { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; margin-bottom: 7px; }
  .addendum-header { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 5px; }
  .addendum-body { font-size: 11px; color: #1e293b; line-height: 1.5; }

  /* Signature */
  .sig-section { padding: 14px 18px; display: flex; justify-content: flex-end; }
  .sig-box { border-top: 1px solid #94a3b8; padding-top: 8px; width: 200px; text-align: center; }
  .sig-box .sig-name { font-weight: 700; font-size: 11px; color: #0c4a6e; }
  .sig-box .sig-sub { font-size: 9px; color: #64748b; margin-top: 2px; }

  /* Footer */
  .footer { padding: 7px 18px; background: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; text-align: center; border-radius: 0 0 4px 4px; }

  @media print {
    body { background: #fff; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<!-- Encabezado clínica -->
<div class="header">
  ${cfg.clinicLogoUrl ? `<div class="logo"><img src="${esc(cfg.clinicLogoUrl)}" alt="Logo"/></div>` : ''}
  <div>
    <h1>${esc(cfg.clinicName)}</h1>
    <div class="sub">
      ${cfg.clinicAddress ? `<span>${esc(cfg.clinicAddress)}</span>` : ''}
      ${cfg.clinicPhone ? `<span>Tel. ${esc(cfg.clinicPhone)}</span>` : ''}
      ${cfg.clinicEmail ? `<span>${esc(cfg.clinicEmail)}</span>` : ''}
      ${cfg.clinicCofepris ? `<span>COFEPRIS AF: ${esc(cfg.clinicCofepris)}</span>` : ''}
    </div>
  </div>
</div>

<!-- Médico -->
<div class="doc-strip">
  <div class="doc-info">
    ${cfg.doctorUniversityLogoUrl ? `<div class="uni-logo"><img src="${esc(cfg.doctorUniversityLogoUrl)}" alt="Universidad"/></div>` : ''}
    <div>
      <div class="name">${esc(cfg.doctorName)}</div>
      ${cfg.doctorUniversity ? `<div class="uni">${esc(cfg.doctorUniversity)}</div>` : ''}
    </div>
  </div>
  <div class="cedulas">
    ${cfg.doctorLicense ? `<span class="ced gen">Céd. Prof. ${esc(cfg.doctorLicense)}</span>` : ''}
    ${cfg.doctorSpecialtyLicense ? `<span class="ced esp">Céd. Esp. ${esc(cfg.doctorSpecialtyLicense)}</span>` : ''}
  </div>
</div>

<!-- Tipo de documento -->
<div class="doc-title">
  <div class="title">Nota de Evolución Médica</div>
  <div class="doc-type">ORL — Otorrinolaringología</div>
</div>

<!-- Paciente y fecha -->
<div class="patient-row">
  <div class="field">
    <div class="lbl">Paciente</div>
    <div class="val">${esc(note.patientName)}</div>
  </div>
  <div class="field" style="text-align:center">
    <div class="lbl">Fecha de consulta</div>
    <div class="val">${fmtDate(note.date)}</div>
  </div>
  <div class="field" style="text-align:right">
    <div class="lbl">Hora</div>
    <div class="val">${esc(note.time)}</div>
  </div>
</div>

<!-- SOAP -->
<div class="section">
  <div class="section-title">Nota SOAP</div>
  ${soapRow('S — Subjetivo (motivo / síntomas)', note.consultationReason)}
  ${soapRow('O — Objetivo (exploración física ORL)', note.findings)}
  ${soapRow('A — Evaluación / Análisis', note.updatedDiagnosis)}
  ${soapRow('P — Plan', note.plan)}
</div>

<!-- Diagnósticos CIE-10 -->
${note.diagnosticos.length ? `
<div class="section">
  <div class="section-title">Diagnósticos CIE-10</div>
  ${dxHtml}
</div>` : ''}

<!-- Firma electrónica -->
${note.signed && note.signedAt ? `
<div style="padding: 10px 18px;">
  <div class="signed-banner">
    <strong>✓ Nota firmada electrónicamente</strong> —
    Firmada por <strong>${esc(note.authorName)}</strong> el <strong>${fmtLong(note.signedAt)}</strong>
    (zona horaria Ciudad de México). Conforme a NOM-004-SSA3-2012 y NOM-024-SSA3-2012.
    ${note.firmaHash ? `<div class="hash">SHA-256: ${esc(note.firmaHash)}</div>` : ''}
  </div>
</div>` : ''}

<!-- Adendums -->
${adendaHtml}

<!-- Bloque de firma -->
<div class="sig-section">
  <div class="sig-box">
    <div class="sig-name">${esc(cfg.doctorName)}</div>
    <div class="sig-sub">Firma y sello</div>
  </div>
</div>

<!-- Footer -->
<div class="footer">
  Nota expedida conforme a NOM-004-SSA3-2012 y NOM-024-SSA3-2012 · Uso exclusivo para el expediente del paciente indicado
</div>

</body>
</html>`

  win.document.write(html)
  win.document.close()

  // La CSP (script-src sin unsafe-inline) se hereda en la ventana about:blank y
  // bloquea <script> inline; la impresión se dispara desde el opener.
  const autoPrint = () => win.print()
  if (win.document.readyState === 'complete') autoPrint()
  else win.addEventListener('load', autoPrint)
}
