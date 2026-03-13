import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieEntry = { name: string; value: string; options?: Record<string, unknown> }

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
          return cookieStore.getAll().map(cookie => {
            // Decode legacy base64-encoded auth cookies so Supabase can read them
            if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
              try {
                const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8')
                JSON.parse(decoded) // validate it's proper JSON before using
                return { ...cookie, value: decoded }
              } catch {
                // Not base64-encoded, return as-is
              }
            }
            return cookie
          })
        },
        setAll(cookiesToSet: CookieEntry[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from a Server Component — cookies will be set by middleware
          }
        },
      },
    }
  )

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
        setAll(cookiesToSet: CookieEntry[]) {
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
