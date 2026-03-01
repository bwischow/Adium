import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { pullDailyMetrics } from '@/lib/ingestion'

interface PendingSession {
  access_token:  string
  refresh_token: string | null
  expires_in:    number | null
  accounts:      { id: string; name: string }[]
  companyId:     string
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const raw = cookieStore.get('google_oauth_pending')?.value
  if (!raw) {
    return NextResponse.json({ error: 'No pending Google OAuth session' }, { status: 400 })
  }

  let pending: PendingSession
  try {
    pending = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid session data' }, { status: 400 })
  }

  const body = await request.json()
  const selectedIds: string[] = Array.isArray(body.selectedIds) ? body.selectedIds : []

  // Validate: only allow IDs that came from the original OAuth response
  const validIds = new Set(pending.accounts.map(a => a.id))
  const toSave = pending.accounts.filter(a => selectedIds.includes(a.id) && validIds.has(a.id))

  if (toSave.length === 0) {
    return NextResponse.json({ error: 'No valid accounts selected' }, { status: 400 })
  }

  const supabase = createServiceClient()

  for (const account of toSave) {
    const { data: savedAccount } = await supabase
      .from('ad_accounts')
      .upsert({
        company_id:          pending.companyId,
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
      await pullDailyMetrics(savedAccount.id, 'google_ads', pending.access_token)
    }
  }

  const response = NextResponse.json({ success: true, companyId: pending.companyId })
  response.cookies.delete('google_oauth_pending')
  return response
}
