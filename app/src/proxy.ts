import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === 'development'
  return [
    `default-src 'self'`,
    // strict-dynamic confía en scripts inyectados por scripts con nonce (cubre Turnstile).
    // unsafe-eval solo en dev: React lo usa para reconstruir stack traces del servidor.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com https://js.stripe.com${isDev ? " 'unsafe-eval'" : ''}`,
    // unsafe-inline en style-src: necesario para inline styles de React y next/font en runtime.
    `style-src 'self' 'unsafe-inline'`,
    // img-src: Google Maps, reseñas Google, Stripe, GA4 (beacons de fallback).
    `img-src 'self' data: blob: https://maps.gstatic.com https://*.googleusercontent.com https://lh3.googleusercontent.com https://*.stripe.com https://www.google-analytics.com`,
    `font-src 'self'`,
    `connect-src 'self' https://challenges.cloudflare.com https://api.stripe.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net`,
    `frame-src https://maps.google.com https://www.google.com https://challenges.cloudflare.com https://js.stripe.com`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://challenges.cloudflare.com`,
    `upgrade-insecure-requests`,
    `report-uri /api/csp-report`,
    `report-to csp-endpoint`,
  ].join('; ')
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isStaff        = pathname.startsWith('/staff')
  const isAdminRoute   = pathname.startsWith('/staff/admin')
  const isLoginRoute   = pathname.startsWith('/login')
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

  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
  const csp   = buildCsp(nonce)

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set(
    'Report-To',
    JSON.stringify({
      group: 'csp-endpoint',
      max_age: 10886400,
      endpoints: [{ url: '/api/csp-report' }],
    }),
  )

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|site\\.webmanifest|.*\\.png$|.*\\.svg$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
