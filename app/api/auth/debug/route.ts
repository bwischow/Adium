import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * Temporary debug route to verify cookies and session.
 * Open /api/auth/debug after signing in (e.g. in a new tab) to see:
 * - Whether auth-related cookies are present
 * - What getUser() returns
 * Remove or restrict in production.
 */
export async function GET() {
  const cookieStore = cookies()
  const all = cookieStore.getAll()
  const cookieNames = all.map((c) => c.name)
  const hasSupabaseCookies = cookieNames.some((n) => n.includes('supabase') || n.startsWith('sb-'))

  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  return NextResponse.json({
    hasCookies: all.length > 0,
    cookieNames,
    hasSupabaseCookies,
    user: user ? { id: user.id, email: user.email } : null,
    error: error?.message ?? null,
  })
}
