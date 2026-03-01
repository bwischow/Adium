import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local.')
  }
  return { url, anonKey }
}

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseEnv()

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          console.log('[Server createClient] setAll CALLED with', cookiesToSet.length, 'cookies')
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Called from a Server Component — cookies will be set by middleware
          }
        },
      },
    }
  )

  // MANUALLY inject session from cookie (Supabase SSR is broken)
  const projectRef = url.split('//')[1]?.split('.')[0] || 'unknown'
  const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`)

  if (authCookie) {
    try {
      const sessionData = JSON.parse(Buffer.from(authCookie.value, 'base64').toString())
      console.log('[Server createClient] Manually setting session from cookie')
      await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      })
    } catch (e) {
      console.log('[Server createClient] Failed to set session:', e)
    }
  }

  return supabase
}

/** Service role client — bypasses RLS. Only use in server-side pipeline code. */
export function createServiceClient() {
  const cookieStore = cookies()
  const { url } = getSupabaseEnv()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for createServiceClient')

  return createServerClient(
    url,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
