import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/recuperar-senha',
  '/redefinir-senha',
  '/email-enviado',
  '/api/auth',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isEventoPublico = pathname.startsWith('/eventos/') && pathname.endsWith('/inscricao')

  if (isPublic || isEventoPublico) return NextResponse.next()

  // NextAuth v5 uses __Secure- prefix in production (HTTPS) — must match cookie name + JWT salt
  const secureCookie = process.env.NODE_ENV === 'production'
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie })

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
