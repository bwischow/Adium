import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const isWaitlistMode = process.env.NEXT_PUBLIC_WAITLIST_MODE === 'true'
  const defaultNext = isWaitlistMode ? '/' : '/dashboard'
  const next  = searchParams.get('next') ?? defaultNext

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
