import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { pullDailyMetrics } from '@/lib/ingestion'

/**
 * GET /api/connect/meta/callback
 *
 * Meta OAuth callback. Exchanges the auth code for a short-lived token,
 * upgrades to a long-lived token (~60 days), fetches the user's Meta
 * ad accounts, upserts them into the database, and triggers an initial
 * data pull for each account.
 */

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !state) {
    console.error('[meta/callback] Missing code/state or Meta returned error:', { error, hasCode: !!code, hasState: !!state })
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  let companyId: string
  let userId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    companyId = decoded.companyId
    userId    = decoded.userId
    if (!companyId) throw new Error('Missing companyId in state')
  } catch (err) {
    console.error('[meta/callback] Failed to decode state:', err)
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  const errorRedirect = (reason: string, detail?: string) => {
    const params = new URLSearchParams({ status: 'error', error_reason: reason })
    if (detail) params.set('error_detail', detail)
    return NextResponse.redirect(
      `${origin}/companies/${companyId}/connect?${params}`
    )
  }

  // ── Step 1: Exchange code for short-lived token ─────────────────
  const tokenParams = new URLSearchParams({
    client_id:     process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri:  process.env.META_REDIRECT_URI!,
    code,
  })

  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams}`
  )

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text()
    console.error('[meta/callback] Token exchange failed:', tokenRes.status, errBody)
    return errorRedirect('token_exchange_failed', `HTTP ${tokenRes.status}`)
  }

  const shortLived = await tokenRes.json()

  // ── Step 2: Exchange for long-lived token (~60 days) ────────────
  const longParams = new URLSearchParams({
    grant_type:        'fb_exchange_token',
    client_id:         process.env.META_APP_ID!,
    client_secret:     process.env.META_APP_SECRET!,
    fb_exchange_token: shortLived.access_token,
  })

  const longRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?${longParams}`
  )

  if (!longRes.ok) {
    const errBody = await longRes.text()
    console.error('[meta/callback] Long-lived token exchange failed:', longRes.status, errBody)
    // Fall back to short-lived token rather than failing entirely
  }

  const longLived = longRes.ok ? await longRes.json() : shortLived
  const accessToken: string = longLived.access_token

  // ── Step 3: Fetch the user's ad accounts ────────────────────────
  const accountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`
  )

  if (!accountsRes.ok) {
    const errBody = await accountsRes.text()
    console.error('[meta/callback] Failed to fetch ad accounts:', accountsRes.status, errBody)

    let detail = `HTTP ${accountsRes.status}`
    try {
      const errJson = JSON.parse(errBody)
      if (errJson?.error?.message) detail = errJson.error.message
    } catch {
      // use the status code detail
    }
    return errorRedirect('list_accounts_failed', detail)
  }

  const accountsData = await accountsRes.json()
  const adAccounts: { id: string; name: string }[] = accountsData.data ?? []

  if (adAccounts.length === 0) {
    console.error('[meta/callback] No ad accounts found for this Meta user')
    return errorRedirect('no_accounts_found')
  }

  // ── Step 4: Upsert accounts into database ──────────────────────
  const supabase = createServiceClient()

  for (const metaAccount of adAccounts) {
    const { data: account, error: upsertError } = await supabase
      .from('ad_accounts')
      .upsert({
        company_id:          companyId,
        platform:            'meta',
        platform_account_id: metaAccount.id,
        account_name:        metaAccount.name,
        access_token:        accessToken,
        // Long-lived tokens expire in ~60 days
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
      }, { onConflict: 'platform,platform_account_id' })
      .select()
      .single()

    if (upsertError) {
      console.error(`[meta/callback] Failed to upsert account ${metaAccount.id}:`, upsertError)
      continue
    }

    if (account) {
      try {
        await pullDailyMetrics(account.id, 'meta', accessToken, metaAccount.id)
      } catch (pullErr) {
        console.warn(`[meta/callback] Initial data pull failed for ${metaAccount.id}:`, pullErr)
        // Don't block — account is saved, data will be pulled by nightly cron
      }
    }
  }

  // ── Step 5: Redirect to connect page with success status ────────
  return NextResponse.redirect(
    `${origin}/companies/${companyId}/connect?status=success`
  )
}
