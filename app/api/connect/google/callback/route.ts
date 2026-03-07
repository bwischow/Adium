import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/connect/google/callback
 *
 * Google OAuth callback. Exchanges the auth code for tokens,
 * lists accessible Google Ads customer accounts (filtering out
 * MCC/manager accounts), stores the pending session in Supabase,
 * and redirects to the account selection screen.
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
    console.error('[google/callback] Missing code/state or Google returned error:', { error, hasCode: !!code, hasState: !!state })
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
    console.error('[google/callback] Failed to decode state:', err)
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  const errorRedirect = (reason: string, detail?: string) => {
    const params = new URLSearchParams({ status: 'error', error_reason: reason })
    if (detail) params.set('error_detail', detail)
    return NextResponse.redirect(
      `${origin}/companies/${companyId}/connect?${params}`
    )
  }

  // ── Step 1: Exchange code for tokens ──────────────────────────
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      redirect_uri:  process.env.GOOGLE_ADS_REDIRECT_URI!,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text()
    console.error('[google/callback] Token exchange failed:', tokenRes.status, errBody)
    return errorRedirect('token_exchange_failed', `HTTP ${tokenRes.status}`)
  }

  const tokens = await tokenRes.json()

  // ── Step 2: List accessible customer accounts ─────────────────
  const customerRes = await fetch(
    'https://googleads.googleapis.com/v20/customers:listAccessibleCustomers',
    {
      headers: {
        Authorization:     `Bearer ${tokens.access_token}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    }
  )

  if (!customerRes.ok) {
    const errBody = await customerRes.text()
    console.error('[google/callback] listAccessibleCustomers failed:', customerRes.status, errBody)

    // Parse Google's error for a human-readable message
    let detail = `HTTP ${customerRes.status}`
    try {
      const errJson = JSON.parse(errBody)
      const gErr = errJson?.error
      if (gErr?.message) detail = gErr.message
      if (gErr?.errors?.[0]?.message) detail = gErr.errors[0].message
    } catch {
      // use the status code detail
    }
    return errorRedirect('list_accounts_failed', detail)
  }

  let resourceNames: string[] = []
  try {
    const customerData = await customerRes.json()
    resourceNames = Array.isArray(customerData?.resourceNames) ? customerData.resourceNames : []
  } catch (err) {
    console.error('[google/callback] listAccessibleCustomers: invalid JSON:', err)
    return errorRedirect('list_accounts_failed')
  }

  if (resourceNames.length === 0) {
    console.error('[google/callback] No accessible customers returned')
    return errorRedirect('no_accounts_found')
  }

  // ── Step 3: Fetch account details & filter out manager (MCC) accounts ──
  const accounts: { id: string; name: string }[] = []

  await Promise.all(
    resourceNames.map(async (resourceName) => {
      const id = resourceName.replace('customers/', '')
      try {
        const nameRes = await fetch(
          `https://googleads.googleapis.com/v20/customers/${id}/googleAds:search`,
          {
            method: 'POST',
            headers: {
              Authorization:          `Bearer ${tokens.access_token}`,
              'developer-token':      process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
              'login-customer-id':    id, // required when account might be under an MCC
              'Content-Type':         'application/json',
            },
            body: JSON.stringify({
              query: 'SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1',
            }),
          }
        )

        if (!nameRes.ok) {
          console.warn(`[google/callback] Failed to fetch details for customer ${id}: ${nameRes.status}`)
          return // skip this account
        }

        const nameData = await nameRes.json()
        const customer = nameData?.results?.[0]?.customer

        // Skip MCC / manager accounts — users should pick ad-serving accounts
        if (customer?.manager === true) {
          console.log(`[google/callback] Skipping manager account ${id}`)
          return
        }

        const descriptiveName = customer?.descriptiveName
        accounts.push({
          id,
          name: descriptiveName || `Google Ads ${id}`,
        })
      } catch (err) {
        console.warn(`[google/callback] Error fetching customer ${id}:`, err)
        // Skip this account, don't block the rest
      }
    })
  )

  if (accounts.length === 0) {
    // All accounts were manager accounts, or all queries failed
    console.error('[google/callback] No non-manager ad accounts found among', resourceNames.length, 'accessible customers')
    return errorRedirect('no_ad_accounts')
  }

  // ── Step 4: Store pending session in Supabase ─────────────────
  const supabase = getServiceClient()

  const { data: session, error: insertError } = await supabase
    .from('pending_oauth_sessions')
    .insert({
      company_id:    companyId,
      user_id:       userId,
      platform:      'google_ads',
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_in:    tokens.expires_in ?? null,
      accounts,
    })
    .select('id')
    .single()

  if (insertError || !session) {
    console.error('[google/callback] Failed to store pending session:', insertError)
    return errorRedirect('session_storage_failed')
  }

  // ── Step 5: Redirect to account selection screen ──────────────
  return NextResponse.redirect(
    `${origin}/companies/${companyId}/connect?step=google-select&session=${session.id}`
  )
}
