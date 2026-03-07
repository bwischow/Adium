import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { pullDailyMetrics } from '@/lib/ingestion'

/**
 * POST /api/connect/google/select
 *
 * Consumes a pending OAuth session: saves selected ad accounts to the
 * database and kicks off an initial data pull. The session is marked
 * consumed immediately to prevent double-submit / replay.
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface PendingSession {
  id:            string
  company_id:    string
  access_token:  string
  refresh_token: string | null
  expires_in:    number | null
  accounts:      { id: string; name: string }[]
  consumed_at:   string | null
}

export async function POST(request: Request) {
  const body = await request.json()
  const sessionId: string | undefined = body.sessionId
  const selectedIds: string[] = Array.isArray(body.selectedIds) ? body.selectedIds : []

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // Fetch the pending session
  const { data: session, error: fetchError } = await supabase
    .from('pending_oauth_sessions')
    .select('id, company_id, access_token, refresh_token, expires_in, accounts, consumed_at')
    .eq('id', sessionId)
    .single()

  if (fetchError || !session) {
    console.error('[google/select] Session not found:', sessionId, fetchError?.message)
    return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 })
  }

  if (session.consumed_at) {
    return NextResponse.json({ error: 'Session already used' }, { status: 410 })
  }

  // Mark as consumed immediately to prevent double-submit
  const { error: updateError } = await supabase
    .from('pending_oauth_sessions')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .is('consumed_at', null) // extra safety: only if still unconsumed

  if (updateError) {
    console.error('[google/select] Failed to mark session consumed:', updateError)
    return NextResponse.json({ error: 'Failed to consume session' }, { status: 500 })
  }

  const pending = session as PendingSession

  // Validate: only allow IDs that came from the original OAuth response
  const validIds = new Set(pending.accounts.map(a => a.id))
  const toSave = pending.accounts.filter(a => selectedIds.includes(a.id) && validIds.has(a.id))

  if (toSave.length === 0) {
    return NextResponse.json({ error: 'No valid accounts selected' }, { status: 400 })
  }

  for (const account of toSave) {
    const { data: savedAccount } = await supabase
      .from('ad_accounts')
      .upsert({
        company_id:          pending.company_id,
        platform:            'google_ads',
        platform_account_id: account.id,
        account_name:        account.name,
        access_token:        pending.access_token,
        refresh_token:       pending.refresh_token,
        token_expires_at:    pending.expires_in
          ? new Date(Date.now() + pending.expires_in * 1000).toISOString()
          : null,
        is_active:           true,
      }, { onConflict: 'platform,platform_account_id' })
      .select()
      .single()

    if (savedAccount) {
      try {
        // Pull last 24 hours of metrics immediately after connecting
        await pullDailyMetrics(
          savedAccount.id,
          'google_ads',
          pending.access_token,
          account.id,  // platformAccountId (Google Ads customer ID)
          1             // last 1 day
        )
      } catch (err) {
        // Don't fail the whole flow if the initial pull has issues
        console.error(`[google/select] Initial pull failed for ${account.id}:`, err)
      }
    }
  }

  return NextResponse.json({ success: true, companyId: pending.company_id })
}
