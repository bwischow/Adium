import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('[Login API] Request received')

  try {
    const { email, password } = await request.json()
    console.log('[Login API] Credentials:', { email, hasPassword: !!password })

    if (!email || !password) {
      console.log('[Login API] ERROR: Missing credentials')
      return NextResponse.json(
        {
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      )
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.log('[Login API] ERROR: Missing Supabase config')
      return NextResponse.json(
        {
          error: 'Server configuration error',
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()

    // Use the official Route Handler pattern - cookieStore.set() is automatic
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            console.log('[Login API] setAll() called with', cookiesToSet.length, 'cookies')
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                console.log('[Login API] Setting cookie:', name)
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              console.error('[Login API] Error in setAll:', error)
            }
          },
        },
      }
    )

    console.log('[Login API] Calling Supabase signInWithPassword...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('[Login API] Supabase response:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: error?.message,
      errorStatus: error?.status,
    })

    if (error) {
      // Map Supabase error messages to user-friendly codes
      let errorCode = 'AUTH_ERROR'
      let errorMessage = error.message

      if (error.message.includes('Invalid login credentials')) {
        errorCode = 'INVALID_CREDENTIALS'
        errorMessage = 'Invalid email or password'
      } else if (error.message.includes('Email not confirmed')) {
        errorCode = 'EMAIL_NOT_CONFIRMED'
        errorMessage = 'Please check your email to confirm your account'
      } else if (error.message.includes('User not found')) {
        errorCode = 'USER_NOT_FOUND'
        errorMessage = 'No account found with this email'
      }

      console.log('[Login API] ERROR:', { code: errorCode, message: errorMessage })
      return NextResponse.json(
        { error: errorMessage, code: errorCode },
        { status: 401 }
      )
    }

    if (!data.session) {
      console.log('[Login API] ERROR: No session created (email confirmation required)')
      return NextResponse.json(
        {
          error: 'Please check your email to confirm your account before signing in.',
          code: 'EMAIL_NOT_CONFIRMED'
        },
        { status: 401 }
      )
    }

    console.log('[Login API] SUCCESS: Session created')
    console.log('[Login API] User:', { id: data.user?.id, email: data.user?.email })

    // Explicitly set the session to trigger cookie storage
    console.log('[Login API] Explicitly calling setSession to trigger cookie storage...')
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (setSessionError) {
      console.log('[Login API] setSession ERROR:', setSessionError.message)
    } else {
      console.log('[Login API] setSession successful, cookies should now be set')
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch (err) {
    console.log('[Login API] EXCEPTION:', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Something went wrong',
        code: 'UNEXPECTED_ERROR'
      },
      { status: 500 }
    )
  }
}
