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
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Debug logging
  const sbCookies = request.cookies.getAll().filter(c => c.name.startsWith('sb-'))
  console.log('[Middleware]', {
    pathname,
    hasSbCookies: sbCookies.length > 0,
    sbCookieCount: sbCookies.length,
    hasUser: !!user,
    userId: user?.id
  })

  // Allow auth callback to pass through without authentication check
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  // Redirect unauthenticated users away from protected routes
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/companies')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (isProtected && !user) {
    console.log('[Middleware] Redirecting to login - protected route without user')
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))

    // Copy all cookies from supabaseResponse to redirect response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })

    return redirectResponse
  }

  if (isAuthPage && user) {
    console.log('[Middleware] Redirecting to dashboard - auth page with user')
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))

    // Copy all cookies from supabaseResponse to redirect response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })

    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
