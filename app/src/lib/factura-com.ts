import 'server-only'

const BASE_URL = 'https://api.factura.com/v4'
const API_KEY    = process.env.FACTURA_COM_API_KEY    ?? ''
const SECRET_KEY = process.env.FACTURA_COM_SECRET_KEY ?? ''
const PLUGIN_KEY = '9d4095c8f7ed5785cb14c0e3b033eeb8252416ed'

// Clave SAT para servicios de medicina especializada (ORL)
const CLAVE_PROD_SERV = '85121800'
const CLAVE_UNIDAD    = 'E48'

const FORMA_PAGO: Record<string, string> = {
  efectivo:      '01',
  tarjeta:       '04',
  transferencia: '03',
}

export interface DatosFiscales {
  rfc: string
  razonSocial: string
  regimenFiscal: string
  cpFiscal: string
  usoCfdi: string
}

export interface ConceptoCfdi {
  descripcion: string
  montoTotal: number  // centavos MXN
}

export interface ResultadoCfdi {
  uid: string
  uuid: string
  pdfUrl: string
  xmlUrl: string
}

async function apiFetch(path: string, body: object): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'F-PLUGIN':     PLUGIN_KEY,
      'F-Api-Key':    API_KEY,
      'F-Secret-Key': SECRET_KEY,
    },
    body: JSON.stringify(body),
  })
}

export async function generarCfdi(
  receptor: DatosFiscales,
  concepto: ConceptoCfdi,
  metodoPago: string,
  emailReceptor: string,
): Promise<ResultadoCfdi> {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('Credenciales de factura.com no configuradas (FACTURA_COM_API_KEY / FACTURA_COM_SECRET_KEY)')
  }

  const montoMXN = (concepto.montoTotal / 100).toFixed(2)

  const payload = {
    Receptor: {
      RfcReceptor:             receptor.rfc,
      NombreReceptor:          receptor.razonSocial,
      UsoCFDI:                 receptor.usoCfdi,
      RegimenFiscalReceptor:   receptor.regimenFiscal,
      DomicilioFiscalReceptor: receptor.cpFiscal,
    },
    TipoDocumento: 'factura',
    Conceptos: [
      {
        ClaveProdServ: CLAVE_PROD_SERV,
        Cantidad:      '1',
        ClaveUnidad:   CLAVE_UNIDAD,
        Unidad:        'Servicio',
        ValorUnitario: montoMXN,
        Descripcion:   concepto.descripcion,
        ObjetoImp:     '01', // servicios médicos: no objeto de impuesto (IVA exento)
      },
    ],
    UsoCFDI:     receptor.usoCfdi,
    Serie:       'A',
    MetodoPago:  'PUE',
    FormaPago:   FORMA_PAGO[metodoPago] ?? '01',
    Moneda:      'MXN',
    EnviarCorreo: true,
    CorreoReceptor: emailReceptor,
  }

  const res = await apiFetch('/cfdi40/create', payload)
  const json = await res.json() as {
    response: string
    uid?: string
    uuid?: string
    pdf_url?: string
    xml_url?: string
    message?: string
  }

  if (json.response !== 'success' || !json.uid) {
    throw new Error(json.message ?? 'Error al generar CFDI en factura.com')
  }

  return {
    uid:    json.uid,
    uuid:   json.uuid   ?? '',
    pdfUrl: json.pdf_url ?? '',
    xmlUrl: json.xml_url ?? '',
  }
}
