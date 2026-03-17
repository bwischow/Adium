import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('companies')
    .select('*, industry:industries(id, name, slug), ad_accounts(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, industry_id, industry_other, website, phone, email } = body

  // Build update payload with only provided fields
  const updates: Record<string, unknown> = {}
  if (name !== undefined)           updates.name = name
  if (industry_id !== undefined)    updates.industry_id = industry_id
  if (industry_other !== undefined) updates.industry_other = industry_other
  if (website !== undefined)        updates.website = website
  if (phone !== undefined)          updates.phone = phone
  if (email !== undefined)          updates.email = email

  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('*, industry:industries(id, name, slug)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
