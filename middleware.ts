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

    // Decode and verify the cookie content
    try {
      const decoded = JSON.parse(Buffer.from(authCookie.value, 'base64').toString())
      console.log('[mw] Decoded cookie has access_token:', !!decoded.access_token)
      console.log('[mw] Decoded cookie has refresh_token:', !!decoded.refresh_token)
      console.log('[mw] Decoded cookie has user:', !!decoded.user)
    } catch (e) {
      console.log('[mw] Failed to decode cookie:', e)
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  // Manual cookie reader for debugging
  const cookieReader = {
    getAll() {
      const cookies = request.cookies.getAll()
      console.log('[mw] Manual getAll() - returning', cookies.length, 'cookies')
      cookies.forEach(c => console.log('[mw]   - cookie:', c.name, 'length:', c.value.length))
      return cookies
    },
    setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
      console.log('[mw] Manual setAll() called with', cookiesToSet.length, 'cookies')
      cookiesToSet.forEach(({ name, value, options }) => {
        console.log('[mw]   - setting cookie:', name)
        // Set on request so Supabase can read it on this request
        request.cookies.set(name, value)
        // Set on response so browser receives it
        supabaseResponse.cookies.set(name, value, options)
      })
    },
  }

  // Test: manually call getAll to verify it works
  console.log('[mw] Testing manual getAll()...')
  cookieReader.getAll()

  const supabase = createServerClient(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string,
    {
      cookies: cookieReader,
    }
  )

  console.log('[mw] Calling supabase.auth.getUser()...')
  const { data, error } = await supabase.auth.getUser()
  const user = data.user
  console.log('[mw] getUser() returned, user:', user?.id)

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
