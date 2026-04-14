import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/connect/tiktok/callback
 *
 * TikTok OAuth callback. Exchanges the auth_code for an access token
 * (which also returns advertiser_ids), fetches account details,
 * stores a pending session, and redirects to account selection.
 *
 * Key TikTok differences:
 * - Uses `auth_code` param (not `code`)
 * - Token exchange returns advertiser_ids directly
 * - Uses `Access-Token` header (not `Authorization: Bearer`)
 * - Check response.code === 0 for success, not just HTTP status
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const authCode = searchParams.get('auth_code')
  const state    = searchParams.get('state')
  const error    = searchParams.get('error')

  if (error || !authCode || !state) {
    console.error('[tiktok/callback] Missing auth_code/state or TikTok returned error:', { error, hasCode: !!authCode, hasState: !!state })
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
    console.error('[tiktok/callback] Failed to decode state:', err)
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  const errorRedirect = (reason: string, detail?: string) => {
    const params = new URLSearchParams({ status: 'error', error_reason: reason })
    if (detail) params.set('error_detail', detail)
    return NextResponse.redirect(
      `${origin}/companies/${companyId}/connect?${params}`
    )
  }

  // ── Step 1: Exchange auth_code for access token ─────────────────
  const tokenRes = await fetch(
    'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id:    process.env.TIKTOK_ADS_APP_ID!,
        secret:    process.env.TIKTOK_ADS_APP_SECRET!,
        auth_code: authCode,
      }),
    }
  )

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text()
    console.error('[tiktok/callback] Token exchange failed:', tokenRes.status, errBody)
    return errorRedirect('token_exchange_failed', `HTTP ${tokenRes.status}`)
  }

  const tokenBody = await tokenRes.json()

  // TikTok wraps responses: { code: 0, message: "OK", data: { ... } }
  if (tokenBody.code !== 0) {
    console.error('[tiktok/callback] Token exchange API error:', tokenBody.message)
    return errorRedirect('token_exchange_failed', tokenBody.message)
  }

  const tokenData    = tokenBody.data
  const accessToken  = tokenData.access_token as string
  const advertiserIds: string[] = tokenData.advertiser_ids ?? []

  if (advertiserIds.length === 0) {
    console.error('[tiktok/callback] No advertiser IDs returned from token exchange')
    return errorRedirect('no_accounts_found')
  }

  // ── Step 2: Fetch advertiser details ────────────────────────────
  const infoParams = new URLSearchParams({
    advertiser_ids: JSON.stringify(advertiserIds),
  })

  const infoRes = await fetch(
    `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?${infoParams}`,
    {
      headers: { 'Access-Token': accessToken },
    }
  )

  let adAccounts: { id: string; name: string }[] = []

  if (infoRes.ok) {
    const infoBody = await infoRes.json()
    if (infoBody.code === 0 && infoBody.data?.list) {
      adAccounts = infoBody.data.list.map((adv: any) => ({
        id:   String(adv.advertiser_id),
        name: adv.advertiser_name || `TikTok Account ${adv.advertiser_id}`,
      }))
    }
  }

  // Fallback: if info call fails, use raw advertiser IDs
  if (adAccounts.length === 0) {
    adAccounts = advertiserIds.map(id => ({
      id:   String(id),
      name: `TikTok Account ${id}`,
    }))
  }

  // ── Step 3: Store pending session in Supabase ───────────────────
  const supabase = getServiceClient()

  const { data: session, error: insertError } = await supabase
    .from('pending_oauth_sessions')
    .insert({
      company_id:    companyId,
      user_id:       userId,
      platform:      'tiktok_ads',
      access_token:  accessToken,
      refresh_token: null,  // TikTok refresh handled via separate mechanism
      expires_in:    86400, // ~24 hours
      accounts:      adAccounts,
    })
    .select('id')
    .single()

  if (insertError || !session) {
    console.error('[tiktok/callback] Failed to store pending session:', insertError)
    return errorRedirect('session_storage_failed')
  }

  // ── Step 4: Redirect to account selection screen ────────────────
  return NextResponse.redirect(
    `${origin}/companies/${companyId}/connect?step=tiktok-select&session=${session.id}`
  )
}
