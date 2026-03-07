/**
 * POST /api/cron/nightly
 * Triggered by Vercel Cron (vercel.json) or Supabase pg_cron.
 * Protected by CRON_SECRET header check.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runDataPull, runSpendTierCalculation, runBenchmarkAggregation } from '@/lib/pipeline'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  const log: string[] = []

  try {
    // Cleanup stale pending OAuth sessions (older than 1 hour)
    log.push('Cleaning up stale OAuth sessions…')
    const supabase = getServiceClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('pending_oauth_sessions')
      .delete({ count: 'exact' })
      .lt('created_at', oneHourAgo)
    log.push(`Cleaned up ${count ?? 0} stale OAuth sessions.`)

    log.push('Starting data pull…')
    await runDataPull()
    log.push('Data pull complete.')

    log.push('Starting spend tier calculation…')
    await runSpendTierCalculation()
    log.push('Spend tier calculation complete.')

    log.push('Starting benchmark aggregation…')
    await runBenchmarkAggregation()
    log.push('Benchmark aggregation complete.')

    const duration = ((Date.now() - start) / 1000).toFixed(1)
    log.push(`Pipeline finished in ${duration}s`)

    return NextResponse.json({ ok: true, log })
  } catch (err) {
    console.error('[cron/nightly] Error:', err)
    return NextResponse.json(
      { ok: false, error: (err as Error).message, log },
      { status: 500 }
    )
  }
}
