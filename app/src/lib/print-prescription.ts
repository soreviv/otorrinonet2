import QRCode from 'qrcode'
import type { Prescription } from '@/lib/notas-types'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatDateLong(iso: string): string {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export async function printPrescription(rx: Prescription): Promise<void> {
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return

  const verifyUrl = `${window.location.origin}/verificar/receta/${rx.id}${rx.firmaHash ? `?hash=${rx.firmaHash}` : ''}`
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 100, margin: 1, color: { dark: '#0c4a6e', light: '#ffffff' } })

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
          ${med.route ? `<div><span class="lbl">Vía</span><span class="val">${esc(med.route)}</span></div>` : ''}
        </div>
        ${med.instructions ? `<div class="med-inst">ℹ ${esc(med.instructions)}</div>` : ''}
      </div>
    </div>
  `).join('')

  const sigHtml = rx.signatureData
    ? `<img class="sig-img" src="${rx.signatureData}" alt="Firma autógrafa"/>`
    : `<div class="sig-blank"></div>`

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Receta — ${esc(rx.patientName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; }
  @page { size: letter; margin: 12mm 14mm; }

  /* ── Header clínica ── */
  .header {
    background: #0369a1; color: #fff;
    padding: 12px 16px;
    border-radius: 4px 4px 0 0;
    display: flex; align-items: center; gap: 12px;
  }
  .header .clinic-logo {
    width: 52px; height: 52px; background: #fff;
    border-radius: 7px; padding: 4px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .header .clinic-logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .header h1 { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .header .sub { font-size: 10px; opacity: .85; display: flex; gap: 14px; flex-wrap: wrap; }

  /* ── Doctor strip ── */
  .doc-strip {
    background: #e0f2fe;
    padding: 9px 16px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px;
    border-bottom: 1px solid #bae6fd;
  }
  .doc-strip .doc-info { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; }
  .doc-strip .uni-logo {
    width: 36px; height: 36px; background: #fff; border-radius: 5px;
    padding: 3px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid #bae6fd;
  }
  .doc-strip .uni-logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .doc-strip .name { font-weight: 700; font-size: 12px; color: #0c4a6e; }
  .doc-strip .uni { font-size: 10px; color: #64748b; margin-top: 2px; }
  .doc-strip .cedulas { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
  .ced { font-family: monospace; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
  .ced.general { background: #f1f5f9; color: #475569; }
  .ced.especialidad { background: #dbeafe; color: #1e40af; }

  /* ── Paciente + fecha ── */
  .patient-row {
    display: flex; justify-content: space-between;
    padding: 9px 16px;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  }
  .patient-row .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; }
  .patient-row .val { font-weight: 600; font-size: 13px; color: #0f172a; margin-top: 2px; }

  /* ── Datos clínicos ── */
  .clinical-row {
    padding: 7px 16px;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0;
    display: flex; flex-wrap: wrap; gap: 14px;
  }
  .clinical-row .item .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; display: block; }
  .clinical-row .item .val { font-size: 11px; font-weight: 600; color: #334155; }
  .clinical-row .allergies { width: 100%; }
  .clinical-row .allergies .val { color: #dc2626; }

  /* ── Diagnóstico ── */
  .diag-row {
    padding: 7px 16px;
    background: #fffbeb; border-bottom: 1px solid #fde68a;
  }
  .diag-row .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #92400e; font-weight: 700; }
  .diag-row .val { font-size: 12px; font-weight: 600; color: #1c1917; margin-top: 2px; }

  /* ── Medicamentos ── */
  .meds-section { padding: 12px 16px 4px; }
  .meds-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 10px;
    padding-bottom: 7px;
    border-bottom: 2px solid #e2e8f0;
  }
  .rx-symbol { font-size: 26px; color: #0369a1; font-style: italic; font-weight: 900; line-height: 1; }
  .meds-title { font-size: 11px; font-weight: 700; color: #0c4a6e; text-transform: uppercase; letter-spacing: .06em; }

  .med-card {
    display: flex; gap: 10px;
    padding: 9px 10px;
    background: #f8fafc; border-radius: 6px;
    border: 1px solid #e2e8f0;
    margin-bottom: 7px;
    page-break-inside: avoid;
  }
  .med-num {
    width: 20px; height: 20px; border-radius: 50%;
    background: #dbeafe; color: #1e40af;
    font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .med-body { flex: 1; }
  .med-name { font-weight: 700; font-size: 13px; color: #0f172a; }
  .brand { font-weight: 400; font-style: italic; color: #64748b; font-size: 11px; }
  .med-pres { font-size: 10px; color: #64748b; margin-top: 1px; }
  .med-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 7px; }
  .med-grid .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; display: block; }
  .med-grid .val { font-weight: 600; font-size: 11px; color: #334155; }
  .med-inst { font-size: 10px; color: #0369a1; margin-top: 5px; background: #e0f2fe; padding: 3px 7px; border-radius: 4px; }

  /* ── Timestamp de firma ── */
  .signed-ts {
    margin: 4px 16px 0;
    font-size: 9px; font-family: monospace; color: #64748b;
    background: #f1f5f9; padding: 4px 8px; border-radius: 4px;
  }

  /* ── Sección inferior: firma + sello + QR ── */
  .bottom-section {
    margin: 12px 16px 0;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    page-break-inside: avoid;
  }

  /* Bloque firma + sello */
  .sig-block {
    display: flex;
    align-items: flex-end;
    gap: 20px;
    flex: 1;
  }

  /* Área de firma */
  .sig-area { text-align: center; min-width: 180px; }
  .sig-img { max-width: 180px; max-height: 72px; object-fit: contain; display: block; margin: 0 auto 4px; }
  .sig-blank {
    width: 180px; height: 60px;
    border-bottom: 1.5px solid #475569;
    margin: 0 auto 4px;
  }
  .sig-line { width: 180px; height: 1px; background: #94a3b8; margin: 0 auto 4px; }
  .sig-name { font-weight: 700; font-size: 11px; color: #0c4a6e; }
  .sig-sub { font-size: 9px; color: #64748b; margin-top: 2px; }

  /* Círculo de sello */
  .stamp-circle {
    width: 72px; height: 72px;
    border-radius: 50%;
    border: 1.5px dashed #94a3b8;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-bottom: 2px;
  }
  .stamp-label { font-size: 8px; color: #94a3b8; text-align: center; line-height: 1.3; max-width: 54px; }

  /* QR */
  .qr-box { display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0; }
  .qr-box img { width: 80px; height: 80px; }
  .qr-label { font-size: 8px; color: #64748b; text-align: center; max-width: 80px; line-height: 1.3; }

  /* ── Pie de página ── */
  .footer {
    margin: 10px 16px 0;
    padding: 7px 10px;
    background: #f1f5f9; border-top: 1px solid #e2e8f0;
    border-radius: 0 0 4px 4px;
    display: flex; justify-content: space-between; align-items: center; gap: 8px;
    font-size: 8px; color: #94a3b8;
  }
  .footer .validity { font-weight: 600; color: #64748b; }

  @media print {
    body { background: #fff; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

  <!-- Header: Clínica -->
  <div class="header">
    ${rx.clinicLogoUrl ? `<div class="clinic-logo"><img src="${esc(rx.clinicLogoUrl)}" alt="Logo del consultorio"/></div>` : ''}
    <div class="clinic-info">
      <h1>${esc(rx.clinicName)}</h1>
      <div class="sub">
        ${rx.clinicAddress ? `<span>${esc(rx.clinicAddress)}</span>` : ''}
        ${rx.clinicPhone ? `<span>Tel. ${esc(rx.clinicPhone)}</span>` : ''}
        ${rx.clinicEmail ? `<span>${esc(rx.clinicEmail)}</span>` : ''}
        ${rx.clinicCofepris ? `<span>COFEPRIS AF: ${esc(rx.clinicCofepris)}</span>` : ''}
      </div>
    </div>
  </div>

  <!-- Doctor strip -->
  <div class="doc-strip">
    <div class="doc-info">
      ${rx.doctorUniversityLogoUrl ? `<div class="uni-logo"><img src="${esc(rx.doctorUniversityLogoUrl)}" alt="Escudo universidad"/></div>` : ''}
      <div>
        <div class="name">${esc(rx.doctorName)}</div>
        ${rx.doctorUniversity ? `<div class="uni">${esc(rx.doctorUniversity)}</div>` : ''}
      </div>
    </div>
    <div class="cedulas">
      ${rx.doctorLicense ? `<span class="ced general">Céd. Prof. ${esc(rx.doctorLicense)}</span>` : ''}
      ${rx.doctorSpecialtyLicense ? `<span class="ced especialidad">Céd. Esp. ${esc(rx.doctorSpecialtyLicense)}</span>` : ''}
    </div>
  </div>

  <!-- Paciente + fecha -->
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

  <!-- Datos clínicos -->
  ${(rx.patientAge != null || rx.patientSex || rx.patientWeight || rx.patientHeight || rx.patientBMI != null || rx.patientTemperature != null || rx.patientBloodPressure || rx.patientAllergies?.length) ? `
  <div class="clinical-row">
    ${rx.patientAge != null ? `<div class="item"><span class="lbl">Edad</span><span class="val">${rx.patientAge} años</span></div>` : ''}
    ${rx.patientSex ? `<div class="item"><span class="lbl">Sexo</span><span class="val">${esc(rx.patientSex)}</span></div>` : ''}
    ${rx.patientWeight != null ? `<div class="item"><span class="lbl">Peso</span><span class="val">${rx.patientWeight} kg</span></div>` : ''}
    ${rx.patientHeight != null ? `<div class="item"><span class="lbl">Talla</span><span class="val">${rx.patientHeight} cm</span></div>` : ''}
    ${rx.patientBMI != null ? `<div class="item"><span class="lbl">IMC</span><span class="val">${rx.patientBMI}</span></div>` : ''}
    ${rx.patientTemperature != null ? `<div class="item"><span class="lbl">Temperatura</span><span class="val">${rx.patientTemperature} °C</span></div>` : ''}
    ${rx.patientBloodPressure ? `<div class="item"><span class="lbl">Presión arterial</span><span class="val">${esc(rx.patientBloodPressure)}</span></div>` : ''}
    ${rx.patientAllergies?.length ? `<div class="item allergies"><span class="lbl">Alergias</span><span class="val">${rx.patientAllergies.map(esc).join(', ')}</span></div>` : ''}
  </div>` : ''}

  <!-- Diagnóstico -->
  ${rx.diagnosis ? `
  <div class="diag-row">
    <div class="lbl">Diagnóstico médico</div>
    <div class="val">${esc(rx.diagnosis)}</div>
  </div>` : ''}

  <!-- Medicamentos -->
  <div class="meds-section">
    <div class="meds-header">
      <span class="rx-symbol">℞</span>
      <span class="meds-title">Medicamentos prescritos</span>
    </div>
    ${medsHtml}
  </div>

  <!-- Timestamp firma electrónica -->
  ${rx.signedAt ? `
  <div class="signed-ts">
    ✓ Firmada electrónicamente · ${new Date(rx.signedAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'long', timeStyle: 'short' })}
    ${rx.firmaHash ? `· SHA-256: <span style="color:#475569">${rx.firmaHash}</span>` : ''}
  </div>` : ''}

  <!-- Firma + sello + QR -->
  <div class="bottom-section">

    <div class="sig-block">
      <!-- Firma -->
      <div class="sig-area">
        ${sigHtml}
        <div class="sig-name">${esc(rx.doctorName)}</div>
        <div class="sig-sub">Firma autógrafa${rx.signatureData ? ' registrada' : ''}</div>
      </div>

      <!-- Sello -->
      <div style="text-align:center">
        <div class="stamp-circle">
          <span class="stamp-label">Sello del médico</span>
        </div>
      </div>
    </div>

    <!-- QR verificación -->
    <div class="qr-box">
      <img src="${qrDataUrl}" alt="QR de verificación"/>
      <div class="qr-label">Escanea para verificar autenticidad</div>
    </div>

  </div>

  <!-- Pie -->
  <div class="footer">
    <span>Receta expedida conforme a NOM-004-SSA3-2012 y NOM-024-SSA3-2012 · Uso exclusivo para el paciente indicado</span>
    <span class="validity">Válida por 30 días a partir de la fecha de expedición</span>
  </div>

<script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

  win.document.write(html)
  win.document.close()
}
