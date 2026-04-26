import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === 'development'
  return [
    `default-src 'self'`,
    // 'strict-dynamic' confía en scripts inyectados por scripts con nonce (cubre Turnstile).
    // 'unsafe-eval' solo en dev: React lo usa para reconstruir stack traces del servidor.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // 'unsafe-inline' en style-src es aceptable: inyectar CSS no produce ejecución de código.
    // Es necesario para atributos style="" de componentes React y para estilos de Next.js.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self'`,
    `connect-src 'self' https://challenges.cloudflare.com`,
    `frame-src https://maps.google.com https://www.google.com https://challenges.cloudflare.com`,
    `frame-ancestors 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isStaff = pathname.startsWith('/staff')
  const isAdminRoute = pathname.startsWith('/staff/admin')
  const isLoginRoute = pathname.startsWith('/login')
  const isPendingRoute =
    pathname.startsWith('/login/setup-2fa') ||
    pathname.startsWith('/login/verify-2fa')

  const sessionToken = req.cookies.get('session')?.value
  const session = await decrypt(sessionToken)

  // Protect all /staff/* routes
  if (isStaff && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // /staff/admin is medico-only
  if (isAdminRoute && session?.role !== 'medico') {
    return NextResponse.redirect(new URL('/staff/agenda', req.url))
  }

  // Redirect authenticated users away from /login (but not from 2FA steps)
  if (isLoginRoute && !isPendingRoute && session?.userId) {
    return NextResponse.redirect(new URL('/staff', req.url))
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
