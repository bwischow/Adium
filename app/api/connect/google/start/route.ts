import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const missingVars = ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_REDIRECT_URI'].filter(
    key => !process.env[key]
  )
  if (missingVars.length > 0) {
    console.error('Missing Google Ads env vars:', missingVars)
    return NextResponse.json(
      { error: `Missing environment variables: ${missingVars.join(', ')}` },
      { status: 500 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400 })

  const state = Buffer.from(JSON.stringify({ companyId, userId: user.id })).toString('base64url')

  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_ADS_CLIENT_ID!,
    redirect_uri:  process.env.GOOGLE_ADS_REDIRECT_URI!,
    response_type: 'code',
    scope:         'https://www.googleapis.com/auth/adwords',
    access_type:   'offline',
    prompt:        'consent',
    state,
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  )
}
