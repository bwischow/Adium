'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { INDUSTRIES } from '@/types'

export default function NewCompanyPage() {
  const [name, setName]           = useState('')
  const [industryId, setIndustryId] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, industry_id: Number(industryId) }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Something went wrong')
      setLoading(false)
      return
    }

    // After creating company, go to connect an ad account
    router.push(`/companies/${json.id}/connect`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Create your first company</h1>
        <p className="text-gray-500 text-sm mb-6">
          A company represents a client or business whose ads you manage.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Acme Corp"
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              value={industryId}
              onChange={e => setIndustryId(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select an industry…</option>
              {INDUSTRIES.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white rounded-lg py-2 font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Creating…' : 'Continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
