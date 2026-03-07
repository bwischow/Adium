/**
 * POST /api/accounts/:accountId/pull
 * Triggers an on-demand data pull for the last N days (default 1).
 * Used after account connection and for manual refresh.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { pullDailyMetrics } from '@/lib/ingestion'

export async function POST(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify account belongs to user
  const { data: account, error: accountErr } = await supabase
    .from('ad_accounts')
    .select('id, platform, platform_account_id, access_token, refresh_token, token_expires_at, company:companies!inner(user_id)')
    .eq('id', params.accountId)
    .single()

  if (accountErr || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const company = Array.isArray(account.company) ? account.company[0] : account.company
  if (company.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const daysBack = Math.min(Math.max(body.daysBack ?? 1, 1), 90)

  let accessToken = account.access_token

  // Refresh token if expired (Google Ads)
  if (
    account.platform === 'google_ads' &&
    account.token_expires_at &&
    new Date(account.token_expires_at) < new Date() &&
    account.refresh_token
  ) {
    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: account.refresh_token,
        client_id:     process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        grant_type:    'refresh_token',
      }),
    })
    const refreshData = await refreshRes.json()
    if (refreshData.access_token) {
      accessToken = refreshData.access_token
      const svc = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await svc
        .from('ad_accounts')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        })
        .eq('id', account.id)
    }
  }

  try {
    await pullDailyMetrics(
      account.id,
      account.platform,
      accessToken,
      account.platform_account_id,
      daysBack
    )
    return NextResponse.json({ success: true, daysBack })
  } catch (err) {
    console.error('[pull] on-demand pull failed:', err)
    return NextResponse.json(
      { error: 'Failed to pull metrics' },
      { status: 500 }
    )
  }
}
