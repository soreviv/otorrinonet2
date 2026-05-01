import type { Prescription } from '@/lib/notas-types'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatDateLong(iso: string): string {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function printPrescription(rx: Prescription): void {
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return

  const medsHtml = rx.medications.map((med, i) => `
    <div class="med-card">
      <div class="med-num">${i + 1}</div>
      <div class="med-body">
        <div class="med-name">${esc(med.name)}${med.brandName ? ` <span class="brand">(${esc(med.brandName)})</span>` : ''}</div>
        ${med.presentation ? `<div class="med-pres">${esc(med.presentation)}</div>` : ''}
        <div class="med-grid">
          <div><span class="lbl">Dosis</span><span class="val">${esc(med.dose)}</span></div>
          <div><span class="lbl">Frecuencia</span><span class="val">${esc(med.frequency)}</span></div>
          <div><span class="lbl">Duración</span><span class="val">${esc(med.duration || '—')}</span></div>
        </div>
        ${med.instructions ? `<div class="med-inst">ℹ ${esc(med.instructions)}</div>` : ''}
      </div>
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Receta — ${esc(rx.patientName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; }
  @page { size: letter; margin: 15mm; }

  /* Header */
  .header { background: #0369a1; color: #fff; padding: 14px 18px; border-radius: 4px 4px 0 0; }
  .header h1 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .header .sub { font-size: 10px; opacity: .85; display: flex; gap: 16px; flex-wrap: wrap; }

  /* Doctor strip */
  .doc-strip { background: #e0f2fe; padding: 10px 18px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #bae6fd; }
  .doc-strip .name { font-weight: 700; font-size: 13px; color: #0c4a6e; }
  .doc-strip .uni { font-size: 10px; color: #64748b; margin-top: 2px; }
  .doc-strip .cedulas { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .ced { font-family: monospace; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
  .ced.general { background: #f1f5f9; color: #475569; }
  .ced.especialidad { background: #dbeafe; color: #1e40af; }

  /* Patient + date */
  .patient-row { display: flex; justify-content: space-between; padding: 10px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  .patient-row .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; }
  .patient-row .val { font-weight: 600; font-size: 13px; color: #0f172a; margin-top: 2px; }

  /* Meds section */
  .meds-section { padding: 14px 18px; }
  .rx-symbol { font-size: 28px; color: #0369a1; font-style: italic; font-weight: 900; margin-bottom: 10px; }
  .med-card { display: flex; gap: 12px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px; }
  .med-num { width: 22px; height: 22px; border-radius: 50%; background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .med-body { flex: 1; }
  .med-name { font-weight: 700; font-size: 13px; color: #0f172a; }
  .brand { font-weight: 400; font-style: italic; color: #64748b; font-size: 11px; }
  .med-pres { font-size: 10px; color: #64748b; margin-top: 2px; }
  .med-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px; }
  .med-grid .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; display: block; }
  .med-grid .val { font-weight: 600; font-size: 11px; color: #334155; }
  .med-inst { font-size: 10px; color: #0369a1; margin-top: 6px; background: #e0f2fe; padding: 4px 8px; border-radius: 4px; }

  /* Signature */
  .sig-section { padding: 14px 18px; display: flex; justify-content: flex-end; }
  .sig-box { border-top: 1px solid #94a3b8; padding-top: 8px; width: 200px; text-align: center; }
  .sig-box .sig-name { font-weight: 700; font-size: 11px; color: #0c4a6e; }
  .sig-box .sig-sub { font-size: 9px; color: #64748b; margin-top: 2px; }

  /* Signed timestamp */
  .signed-ts { margin: 0 18px 10px; font-size: 9px; font-family: monospace; color: #64748b; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; }

  /* Footer */
  .footer { padding: 8px 18px; background: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; text-align: center; border-radius: 0 0 4px 4px; }

  @media print {
    body { background: #fff; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <!-- Header: Clinic -->
  <div class="header">
    <h1>${esc(rx.clinicName)}</h1>
    <div class="sub">
      ${rx.clinicAddress ? `<span>📍 ${esc(rx.clinicAddress)}</span>` : ''}
      ${rx.clinicPhone ? `<span>📞 ${esc(rx.clinicPhone)}</span>` : ''}
      ${rx.clinicCofepris ? `<span>COFEPRIS AF: ${esc(rx.clinicCofepris)}</span>` : ''}
    </div>
  </div>

  <!-- Doctor strip -->
  <div class="doc-strip">
    <div>
      <div class="name">${esc(rx.doctorName)}</div>
      ${rx.doctorUniversity ? `<div class="uni">${esc(rx.doctorUniversity)}</div>` : ''}
    </div>
    <div class="cedulas">
      ${rx.doctorLicense ? `<span class="ced general">Céd. Med. ${esc(rx.doctorLicense)}</span>` : ''}
      ${rx.doctorSpecialtyLicense ? `<span class="ced especialidad">Céd. Esp. ${esc(rx.doctorSpecialtyLicense)}</span>` : ''}
    </div>
  </div>

  <!-- Patient + date -->
  <div class="patient-row">
    <div>
      <div class="lbl">Paciente</div>
      <div class="val">${esc(rx.patientName)}</div>
    </div>
    <div style="text-align:right">
      <div class="lbl">Fecha de expedición</div>
      <div class="val">${formatDateLong(rx.date)}</div>
    </div>
  </div>

  <!-- Medications -->
  <div class="meds-section">
    <div class="rx-symbol">℞</div>
    ${medsHtml}
  </div>

  <!-- Firma electrónica -->
  ${rx.signedAt ? `
  <div class="signed-ts">
    ✓ Firmada electrónicamente · ${new Date(rx.signedAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'long', timeStyle: 'short' })}
    ${rx.firmaHash ? `<br/>SHA-256: <span style="color:#475569">${rx.firmaHash}</span>` : ''}
  </div>` : ''}

  <!-- Signature block -->
  <div class="sig-section">
    <div class="sig-box">
      <div class="sig-name">${esc(rx.doctorName)}</div>
      <div class="sig-sub">Firma y sello</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    Receta expedida conforme a NOM-004-SSA3-2012 y NOM-024-SSA3-2012 · Uso exclusivo para el paciente indicado
  </div>

<script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

  win.document.write(html)
  win.document.close()
}
