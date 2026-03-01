import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  let companyId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    companyId = decoded.companyId
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?connect=error`)
  }

  // Exchange code for tokens
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
    console.error('Google token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=error`)
  }

  const tokens = await tokenRes.json()

  // Fetch accessible customer accounts from Google Ads API
  const customerRes = await fetch(
    'https://googleads.googleapis.com/v16/customers:listAccessibleCustomers',
    {
      headers: {
        Authorization:     `Bearer ${tokens.access_token}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    }
  )

  if (!customerRes.ok) {
    console.error('listAccessibleCustomers failed:', customerRes.status, await customerRes.text())
    return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=error`)
  }

  let resourceNames: string[] = []
  try {
    const customerData = await customerRes.json()
    resourceNames = Array.isArray(customerData?.resourceNames) ? customerData.resourceNames : []
  } catch {
    console.error('listAccessibleCustomers: invalid JSON response')
    return NextResponse.redirect(`${origin}/companies/${companyId}/connect?status=error`)
  }

  // Try to fetch descriptive names for each account in parallel
  const accounts = await Promise.all(
    resourceNames.map(async (resourceName) => {
      const id = resourceName.replace('customers/', '')
      try {
        const nameRes = await fetch(
          `https://googleads.googleapis.com/v16/customers/${id}/googleAds:search`,
          {
            method: 'POST',
            headers: {
              Authorization:     `Bearer ${tokens.access_token}`,
              'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
              'Content-Type':    'application/json',
            },
            body: JSON.stringify({
              query: 'SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1',
            }),
          }
        )
        if (nameRes.ok) {
          const nameData = await nameRes.json()
          const descriptiveName = nameData?.results?.[0]?.customer?.descriptiveName
          if (descriptiveName) return { id, name: descriptiveName }
        }
      } catch {
        // fall through to default
      }
      return { id, name: `Google Ads ${id}` }
    })
  )

  // Store pending OAuth state in an HTTP-only cookie for the selection step
  const pending = JSON.stringify({
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_in:    tokens.expires_in ?? null,
    accounts,
    companyId,
  })

  const response = NextResponse.redirect(
    `${origin}/companies/${companyId}/connect?step=google-select`
  )
  response.cookies.set('google_oauth_pending', pending, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   600, // 10 minutes
    path:     '/',
  })
  return response
}
