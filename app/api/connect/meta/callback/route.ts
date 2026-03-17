import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/connect/meta/callback
 *
 * Meta OAuth callback. Exchanges the auth code for a short-lived token,
 * upgrades to a long-lived token (~60 days), fetches the user's Meta
 * ad accounts, stores a pending session, and redirects to account selection.
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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
    if (!companyId || !userId) throw new Error('Missing companyId or userId in state')
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
    `https://graph.facebook.com/v25.0/oauth/access_token?${tokenParams}`
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
    `https://graph.facebook.com/v25.0/oauth/access_token?${longParams}`
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
    `https://graph.facebook.com/v25.0/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`
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

  // ── Step 3b: Fetch the user's Pages (pages_show_list) ───────────
  const pagesRes = await fetch(
    `https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`
  )
  const pagesData = pagesRes.ok ? await pagesRes.json() : { data: [] }
  const pages: { id: string; name: string; access_token?: string }[] = pagesData.data ?? []
  console.log(`[meta/callback] Found ${pages.length} Pages:`, pages.map(p => ({ id: p.id, name: p.name })))

  // ── Step 3c–3e: Exercise Page permissions ──────────────────────
  if (pages.length > 0 && pages[0].access_token) {
    const pageId    = pages[0].id
    const pageToken = pages[0].access_token

    // pages_read_engagement + read_insights — read Page-level insights
    // Do NOT include since/until so Meta returns the most recent available data
    const insightsUrl = `https://graph.facebook.com/v25.0/${pageId}/insights?metric=page_impressions&period=day&access_token=${pageToken}`
    console.log(`[meta/callback] Calling Page Insights:`, insightsUrl.replace(pageToken, '<REDACTED>'))
    const engageRes = await fetch(insightsUrl)
    const engageBody = await engageRes.json()
    console.log(`[meta/callback] pages_read_engagement response (${engageRes.status}):`, JSON.stringify(engageBody, null, 2))

    // pages_manage_metadata — subscribe app to Page webhooks
    const metaRes = await fetch(
      `https://graph.facebook.com/v25.0/${pageId}/subscribed_apps`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribed_fields: ['feed'],
          access_token: pageToken,
        }),
      }
    )
    console.log(`[meta/callback] pages_manage_metadata (${metaRes.status}):`, await metaRes.text())

    // pages_manage_ads — read ad posts for the Page
    const adsRes = await fetch(
      `https://graph.facebook.com/v25.0/${pageId}/ads_posts?fields=id,message&limit=1&access_token=${pageToken}`
    )
    console.log(`[meta/callback] pages_manage_ads (${adsRes.status}):`, await adsRes.text())
  } else {
    console.log('[meta/callback] No Pages with access tokens — Page permission calls skipped')
  }

  if (adAccounts.length === 0) {
    console.error('[meta/callback] No ad accounts found for this Meta user')
    return errorRedirect('no_accounts_found')
  }

  // ── Step 4: Store pending session in Supabase ─────────────────
  const supabase = getServiceClient()

  const { data: session, error: insertError } = await supabase
    .from('pending_oauth_sessions')
    .insert({
      company_id:    companyId,
      user_id:       userId,
      platform:      'meta',
      access_token:  accessToken,
      refresh_token: null,
      expires_in:    60 * 24 * 60 * 60, // ~60 days in seconds
      accounts:      adAccounts,
    })
    .select('id')
    .single()

  if (insertError || !session) {
    console.error('[meta/callback] Failed to store pending session:', insertError)
    return errorRedirect('session_storage_failed')
  }

  // ── Step 5: Redirect to account selection screen ──────────────
  return NextResponse.redirect(
    `${origin}/companies/${companyId}/connect?step=meta-select&session=${session.id}`
  )
}
