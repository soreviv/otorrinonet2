import type { ConsentForm } from '@/lib/notas-types'
import type { CLINIC_CONFIG } from '@/lib/clinic-config'

type ClinicConfig = typeof CLINIC_CONFIG

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmtDate(iso: string): string {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

/** Convierte el texto markdown-lite (## encabezado / párrafos) en HTML del cuerpo. */
function renderBody(text: string): string {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  return blocks
    .map((block) =>
      block.startsWith('## ')
        ? `<h2 class="sec">${esc(block.slice(3).trim())}</h2>`
        : `<p class="par">${esc(block)}</p>`,
    )
    .join('\n')
}

export function printConsent(consent: ConsentForm, cfg: ClinicConfig): void {
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return

  const isSigned = consent.status === 'firmado-presencial' || consent.status === 'firmado-correo'
  const sigHtml =
    isSigned && consent.patientSignatureData
      ? `<img class="sig-img" src="${consent.patientSignatureData}" alt="Firma del paciente"/>`
      : `<div class="sig-blank"></div>`

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Consentimiento — ${esc(consent.procedure)} — ${esc(consent.patientName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; line-height: 1.5; }
  @page { size: letter; margin: 14mm 16mm; }

  .print-bar {
    position: sticky; top: 0; z-index: 100;
    background: #0c4a6e; color: #fff;
    padding: 10px 16px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,.25);
  }
  .print-bar span { font-size: 13px; font-weight: 600; }
  .print-bar .btn-print { background: #fff; color: #0c4a6e; border: none; border-radius: 5px; padding: 7px 20px; font-size: 13px; font-weight: 700; cursor: pointer; }
  .print-bar .btn-print:hover { background: #e0f2fe; }
  .print-bar .btn-close { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.45); border-radius: 5px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; }

  .header { background: #0369a1; color: #fff; padding: 12px 16px; border-radius: 4px 4px 0 0; }
  .header h1 { font-size: 15px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 3px; }
  .header .sub { font-size: 10px; color: #e0f2fe; display: flex; gap: 14px; flex-wrap: wrap; }

  .doc-title { text-align: center; padding: 12px 16px 4px; }
  .doc-title .kicker { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #64748b; font-weight: 700; }
  .doc-title h2 { font-size: 18px; color: #0c4a6e; font-weight: 800; margin-top: 3px; }

  .patient-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 9px 16px; margin: 6px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
  .patient-row .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; }
  .patient-row .val { font-weight: 600; font-size: 13px; color: #0f172a; margin-top: 2px; }

  .body { padding: 6px 16px; text-align: justify; }
  .body .sec { font-size: 12px; font-weight: 700; color: #0c4a6e; text-transform: uppercase; letter-spacing: .03em; margin: 12px 0 5px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0; page-break-after: avoid; }
  .body .par { margin-bottom: 6px; }

  .revocacion { margin: 10px 16px 0; padding: 9px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; page-break-inside: avoid; }
  .revocacion h3 { font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
  .revocacion p { font-size: 11px; color: #78350f; }

  .place-date { padding: 14px 16px 4px; font-size: 12px; }

  .signatures { display: flex; flex-wrap: wrap; gap: 28px; justify-content: space-around; padding: 18px 16px 0; page-break-inside: avoid; }
  .sig-area { text-align: center; min-width: 200px; flex: 1; }
  .sig-img { max-width: 200px; max-height: 70px; object-fit: contain; display: block; margin: 0 auto 2px; }
  .sig-blank { height: 60px; }
  .sig-line { border-top: 1px solid #334155; margin: 0 auto; width: 220px; }
  .sig-name { font-weight: 700; font-size: 11px; color: #0c4a6e; margin-top: 4px; }
  .sig-sub { font-size: 9px; color: #64748b; margin-top: 1px; }

  .signed-ts { margin: 12px 16px 0; font-size: 9px; color: #64748b; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; }

  .footer { margin: 14px 16px 0; padding: 7px 10px; background: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; text-align: center; }

  @media print {
    body { background: #fff; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

  <div class="print-bar no-print">
    <span>Vista previa del consentimiento</span>
    <div style="display:flex;gap:8px">
      <button class="btn-print" type="button">Imprimir</button>
      <button class="btn-close" type="button">Cerrar</button>
    </div>
  </div>

  <div class="header">
    <h1>${esc(cfg.clinicName)}</h1>
    <div class="sub">
      ${cfg.clinicAddress ? `<span>${esc(cfg.clinicAddress)}</span>` : ''}
      ${cfg.clinicPhone ? `<span>Tel. ${esc(cfg.clinicPhone)}</span>` : ''}
      ${cfg.clues ? `<span>CLUES: ${esc(cfg.clues)}</span>` : ''}
    </div>
  </div>

  <div class="doc-title">
    <div class="kicker">Consentimiento informado · NOM-004-SSA3-2012</div>
    <h2>${esc(consent.procedure)}</h2>
  </div>

  <div class="patient-row">
    <div>
      <div class="lbl">Paciente</div>
      <div class="val">${esc(consent.patientName)}</div>
    </div>
    <div style="text-align:right">
      <div class="lbl">Fecha de elaboración</div>
      <div class="val">${fmtDate(consent.createdAt)}</div>
    </div>
  </div>

  <div class="body">
    ${renderBody(consent.consentText)}
  </div>

  <div class="revocacion">
    <h3>Revocación del consentimiento</h3>
    <p>Por la presente, ANULO cualquier autorización plasmada en el presente documento, que queda sin efecto a partir del momento de la firma. Me han sido explicadas las repercusiones que, sobre la evolución de mi proceso, esta anulación pudiera derivar y, en consecuencia, las entiendo y asumo.</p>
  </div>

  <div class="place-date">Ciudad de México a _______ de ______________________ de 20____.</div>

  <div class="signatures">
    <div class="sig-area">
      ${sigHtml}
      <div class="sig-line"></div>
      <div class="sig-name">${esc(consent.patientName)}</div>
      <div class="sig-sub">Paciente ${consent.status === 'firmado-correo' ? '(firma por correo)' : '(o representante legal)'}</div>
    </div>
    <div class="sig-area">
      <div class="sig-blank"></div>
      <div class="sig-line"></div>
      <div class="sig-name">${esc(cfg.doctorName)}</div>
      <div class="sig-sub">Médico tratante${cfg.doctorSpecialtyLicense ? ` · Céd. Esp. ${esc(cfg.doctorSpecialtyLicense)}` : ''}</div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-area">
      <div class="sig-blank"></div>
      <div class="sig-line"></div>
      <div class="sig-name">&nbsp;</div>
      <div class="sig-sub">Testigo</div>
    </div>
    <div class="sig-area">
      <div class="sig-blank"></div>
      <div class="sig-line"></div>
      <div class="sig-name">&nbsp;</div>
      <div class="sig-sub">Testigo</div>
    </div>
  </div>

  ${isSigned && consent.signedAt ? `
  <div class="signed-ts">
    ✓ Consentimiento firmado (${consent.signatureMethod === 'presencial' ? 'presencial' : 'correo electrónico'}) ·
    ${new Date(consent.signedAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'long', timeStyle: 'short' })}
  </div>` : ''}

  <div class="footer">
    Documento elaborado conforme a la NOM-004-SSA3-2012 del expediente clínico · Uso exclusivo para el paciente indicado
  </div>

</body>
</html>`

  win.document.write(html)
  win.document.close()

  // La CSP (script-src sin unsafe-inline) bloquea onclick/<script> inline;
  // los listeners se adjuntan desde el opener (ver print-prescription.ts).
  win.document.querySelector('.btn-print')?.addEventListener('click', () => win.print())
  win.document.querySelector('.btn-close')?.addEventListener('click', () => win.close())

  const autoPrint = () => { win.focus(); win.print() }
  if (win.document.readyState === 'complete') autoPrint()
  else win.addEventListener('load', autoPrint)
}
