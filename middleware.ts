import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local.')
}

export async function middleware(request: NextRequest) {
  // Debug: show incoming cookies
  console.log('[mw] cookies:', request.cookies.getAll().map(c => c.name))

  // Debug: show cookie VALUES
  const authCookie = request.cookies.get('sb-cmytcofakqsfhioyxwja-auth-token')
  if (authCookie) {
    console.log('[mw] auth cookie value length:', authCookie.value.length)
    console.log('[mw] auth cookie value preview:', authCookie.value.substring(0, 100))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log('[mw] Supabase getAll() called, returning', cookies.length, 'cookies')
          return cookies
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          console.log('[mw] Supabase setAll() called with', cookiesToSet.length, 'cookies')
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set on request so Supabase can read it on this request
            request.cookies.set(name, value)
            // Set on response so browser receives it
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh the session — required for Server Components
  const { data, error } = await supabase.auth.getUser()
  const user = data.user

  // Also check the session
  const { data: sessionData } = await supabase.auth.getSession()
  console.log('[mw] getSession result:', {
    hasSession: !!sessionData.session,
    hasAccessToken: !!sessionData.session?.access_token
  })

  console.log(
    '[mw]',
    request.nextUrl.pathname,
    'user:',
    user?.id,
    'error:',
    error?.message
  )

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/companies')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (isProtected && !user) {
    const redirect = NextResponse.redirect(new URL('/login', request.url))
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      redirect.cookies.set(name, value)
    )
    return redirect
  }

  if (isAuthPage && user) {
    const redirect = NextResponse.redirect(new URL('/dashboard', request.url))
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      redirect.cookies.set(name, value)
    )
    return redirect
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
