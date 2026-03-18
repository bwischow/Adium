'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { INDUSTRIES } from '@/types'

const OTHER_INDUSTRY_ID = 8

export default function NewCompanyPage() {
  const [name, setName]                   = useState('')
  const [industryId, setIndustryId]       = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload: Record<string, unknown> = {
      name,
      industry_id: Number(industryId),
    }
    if (Number(industryId) === OTHER_INDUSTRY_ID && industryOther.trim()) {
      payload.industry_other = industryOther.trim()
    }

    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.push(`/companies/${json.id}/connect`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="border border-white/20 p-8 w-full max-w-lg">
        <div className="bg-terminal px-6 py-5 mb-6 border border-black">
          <h1 className="text-xs font-bold text-black tracking-widest">Initialize Company</h1>
        </div>

        <p className="text-xs text-white/40 mb-2 tracking-wide">
          A company represents a client or business whose ads you manage.
        </p>
        <p className="text-[10px] text-white/30 mb-6 tracking-wide">
          You can always add more companies later from your dashboard.
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 mb-4 text-xs tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">
              Company Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Acme Corp"
              disabled={loading}
              className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">
              Industry
            </label>
            <p className="text-[10px] text-white/30 mb-2 tracking-wide">If you are an agency, select the industry that best represents this client.</p>
            <select
              value={industryId}
              onChange={e => setIndustryId(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-white/20 bg-black px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach"
            >
              <option value="">Select an industry…</option>
              {INDUSTRIES.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>

          {Number(industryId) === OTHER_INDUSTRY_ID && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">
                Describe Your Industry
              </label>
              <input
                type="text"
                value={industryOther}
                onChange={e => setIndustryOther(e.target.value)}
                placeholder="e.g. Pet supplies, Agriculture, etc."
                disabled={loading}
                className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              />
              <p className="text-[10px] text-white/30 mt-1 tracking-wide">This helps us add new industry categories in the future.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-peach text-black py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark disabled:opacity-60 transition-colors"
          >
            {loading ? 'Creating…' : 'Continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
