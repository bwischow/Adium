import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/connect/linkedin/callback
 *
 * LinkedIn OAuth callback. Exchanges the auth code for an access token,
 * fetches the user's LinkedIn ad accounts, stores a pending session,
 * and redirects to account selection.
 */

const LINKEDIN_API_VERSION = '202401'

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
    console.error('[linkedin/callback] Missing code/state or LinkedIn returned error:', { error, hasCode: !!code, hasState: !!state })
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
    console.error('[linkedin/callback] Failed to decode state:', err)
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  const errorRedirect = (reason: string, detail?: string) => {
    const params = new URLSearchParams({ status: 'error', error_reason: reason })
    if (detail) params.set('error_detail', detail)
    return NextResponse.redirect(
      `${origin}/companies/${companyId}/connect?${params}`
    )
  }

  // ── Step 1: Exchange code for access token ──────────────────────
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      client_id:     process.env.LINKEDIN_ADS_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_ADS_CLIENT_SECRET!,
      redirect_uri:  process.env.LINKEDIN_ADS_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text()
    console.error('[linkedin/callback] Token exchange failed:', tokenRes.status, errBody)
    return errorRedirect('token_exchange_failed', `HTTP ${tokenRes.status}`)
  }

  const tokenData = await tokenRes.json()
  const accessToken: string  = tokenData.access_token
  const refreshToken: string | null = tokenData.refresh_token ?? null
  const expiresIn: number    = tokenData.expires_in ?? 5184000 // ~60 days default

  // ── Step 2: Fetch the user's LinkedIn ad accounts ───────────────
  const accountsRes = await fetch(
    'https://api.linkedin.com/rest/adAccounts?q=search&search=(status:(values:List(ACTIVE)))&count=100',
    {
      headers: {
        Authorization:                  `Bearer ${accessToken}`,
        'LinkedIn-Version':             LINKEDIN_API_VERSION,
        'X-Restli-Protocol-Version':    '2.0.0',
      },
    }
  )

  if (!accountsRes.ok) {
    const errBody = await accountsRes.text()
    console.error('[linkedin/callback] Failed to fetch ad accounts:', accountsRes.status, errBody)
    return errorRedirect('list_accounts_failed', `HTTP ${accountsRes.status}`)
  }

  const accountsData = await accountsRes.json()
  const elements: any[] = accountsData.elements ?? []

  // LinkedIn IDs are numeric but may come in URN format (urn:li:sponsoredAccount:12345)
  // Store just the numeric ID for consistency with other platforms.
  const adAccounts = elements.map((el: any) => {
    const rawId = String(el.id)
    const numericId = rawId.includes(':') ? rawId.split(':').pop()! : rawId
    return {
      id:   numericId,
      name: el.name || `LinkedIn Account ${numericId}`,
    }
  })

  if (adAccounts.length === 0) {
    console.error('[linkedin/callback] No active ad accounts found for this LinkedIn user')
    return errorRedirect('no_accounts_found')
  }

  // ── Step 3: Store pending session in Supabase ───────────────────
  const supabase = getServiceClient()

  const { data: session, error: insertError } = await supabase
    .from('pending_oauth_sessions')
    .insert({
      company_id:    companyId,
      user_id:       userId,
      platform:      'linkedin_ads',
      access_token:  accessToken,
      refresh_token: refreshToken,
      expires_in:    expiresIn,
      accounts:      adAccounts,
    })
    .select('id')
    .single()

  if (insertError || !session) {
    console.error('[linkedin/callback] Failed to store pending session:', insertError)
    return errorRedirect('session_storage_failed')
  }

  // ── Step 4: Redirect to account selection screen ────────────────
  return NextResponse.redirect(
    `${origin}/companies/${companyId}/connect?step=linkedin-select&session=${session.id}`
  )
}
