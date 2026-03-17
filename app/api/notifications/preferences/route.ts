import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_PREFS = {
  emails_enabled: true,
  drift_alerts: { cpc: true, cpm: true, ctr: true, roas: true, cpa: true, cpl: true },
  benchmark_alerts: { cpc: true, cpm: true, ctr: true, roas: true, cpa: true, cpl: true },
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('emails_enabled, drift_alerts, benchmark_alerts')
    .eq('user_id', user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    return NextResponse.json(DEFAULT_PREFS)
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { emails_enabled, drift_alerts, benchmark_alerts } = body

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(
      {
        user_id: user.id,
        emails_enabled,
        drift_alerts,
        benchmark_alerts,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('emails_enabled, drift_alerts, benchmark_alerts')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
