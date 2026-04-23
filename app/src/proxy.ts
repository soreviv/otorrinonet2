import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

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

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
}
