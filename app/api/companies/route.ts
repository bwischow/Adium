import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('companies')
    .select('*, industry:industries(id, name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, industry_id, industry_other } = body

  if (!name || !industry_id) {
    return NextResponse.json({ error: 'name and industry_id are required' }, { status: 400 })
  }

  const insert: Record<string, unknown> = { user_id: user.id, name, industry_id }
  if (industry_other) insert.industry_other = industry_other

  const { data, error } = await supabase
    .from('companies')
    .insert(insert)
    .select('*, industry:industries(id, name, slug)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
