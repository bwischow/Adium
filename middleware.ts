import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    'https://cmytcofakqsfhioyxwja.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteXRjb2Zha3FzZmhpb3l4d2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MjIxMjgsImV4cCI6MjA1MDk5ODEyOH0.xN3BHCElUVEPK18eHKd2aLw4xQnA4-RXnr6Q2XxPomk',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
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

  // Allow auth callback to pass through without authentication check
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  // Redirect unauthenticated users away from protected routes
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/companies')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
