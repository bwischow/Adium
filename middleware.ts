import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — required for Server Components
  const { data: { user }, error } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Debug logging
  console.log('[Middleware]', {
    pathname,
    hasUser: !!user,
    userId: user?.id,
    error: error?.message,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...'
  })

  // Add debug header
  supabaseResponse.headers.set('X-Middleware-User', user ? 'authenticated' : 'anonymous')
  supabaseResponse.headers.set('X-Middleware-Path', pathname)

  // Allow auth callback to pass through without authentication check
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  // Redirect unauthenticated users away from protected routes
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/companies')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (isProtected && !user) {
    console.log('[Middleware] Redirecting to login - protected route without user')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && user) {
    console.log('[Middleware] Redirecting to dashboard - auth page with user')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
