import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Endpoint para verificar las cabeceras de seguridad que se están enviando
// Útil para debugging: curl -I https://tudominio.com/api/security-headers

export async function GET(req: NextRequest) {
  const headers = req.headers
  
  const securityHeaders = {
    csp: headers.get('Content-Security-Policy') || 'NOT SET',
    xContentTypeOptions: headers.get('X-Content-Type-Options') || 'NOT SET',
    xFrameOptions: headers.get('X-Frame-Options') || 'NOT SET',
    xXssProtection: headers.get('X-XSS-Protection') || 'NOT SET',
    referrerPolicy: headers.get('Referrer-Policy') || 'NOT SET',
    permissionsPolicy: headers.get('Permissions-Policy') || 'NOT SET',
    hsts: headers.get('Strict-Transport-Security') || 'NOT SET',
    reportTo: headers.get('Report-To') || 'NOT SET',
  }
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    securityHeaders,
    // También mostrar todas las cabeceras para debugging
    allHeaders: Object.fromEntries(headers.entries()),
  })
}
