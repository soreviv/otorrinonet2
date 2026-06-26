import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Endpoint para recibir reportes de violaciones de CSP
// Los navegadores envían reportes en formato JSON según el estándar
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP/Reporting

export async function POST(req: NextRequest) {
  try {
    const report = await req.json()
    
    // Log del reporte para debugging
    console.log('CSP Violation Report:', JSON.stringify(report, null, 2))
    
    // Aquí podrías:
    // 1. Guardar en base de datos
    // 2. Enviar a un servicio de monitoreo
    // 3. Notificar por email/Slack
    
    return NextResponse.json(
      { status: 'received', message: 'CSP violation report received' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing CSP report:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to process CSP report' },
      { status: 500 }
    )
  }
}

// También aceptar GET para testing
export async function GET() {
  return NextResponse.json(
    { status: 'ok', message: 'CSP report endpoint is active' },
    { status: 200 }
  )
}
