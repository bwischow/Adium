import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { INDUSTRIES } from '@/types'

const VALID_SLUGS = new Set(INDUSTRIES.map(i => i.slug))

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, company, industry } = body as Record<string, string>

  if (!name?.trim() || !email?.trim() || !company?.trim() || !industry?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  if (!VALID_SLUGS.has(industry)) {
    return NextResponse.json({ error: 'Invalid industry.' }, { status: 400 })
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('waitlist_signups')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      industry,
    })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: "You're already on the list!" }, { status: 200 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Success' }, { status: 201 })
}
