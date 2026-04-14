import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/connect/linkedin/accounts?session=<uuid>
 *
 * Returns the list of LinkedIn Ads accounts stored in a pending OAuth session.
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session parameter' }, { status: 400 })
  }

  const supabase = getServiceClient()

  const { data: session, error } = await supabase
    .from('pending_oauth_sessions')
    .select('accounts, consumed_at')
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    console.error('[linkedin/accounts] Session not found:', sessionId, error?.message)
    return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 })
  }

  if (session.consumed_at) {
    return NextResponse.json({ error: 'Session already used' }, { status: 410 })
  }

  return NextResponse.json({ accounts: session.accounts })
}
