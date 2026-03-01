'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ConnectAccountPage() {
  const { id: companyId } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'success') {
      router.push(`/dashboard?company=${companyId}`)
    }
  }, [searchParams, companyId, router])

  const handleConnect = (platform: 'google' | 'meta') => {
    window.location.href = `/api/connect/${platform}/start?company_id=${companyId}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Connect an ad account</h1>
        <p className="text-gray-500 text-sm mb-8">
          Connect at least one Google Ads or Meta Ads account so we can pull
          your data and start benchmarking.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleConnect('google')}
            className="w-full flex items-center gap-4 border border-gray-200 rounded-xl px-5 py-4 hover:border-brand-500 hover:bg-brand-50 transition-colors"
          >
            <span className="text-2xl">🔵</span>
            <div className="text-left">
              <p className="font-semibold">Connect Google Ads</p>
              <p className="text-xs text-gray-500">Authorize read access to your Google Ads account</p>
            </div>
          </button>

          <button
            onClick={() => handleConnect('meta')}
            className="w-full flex items-center gap-4 border border-gray-200 rounded-xl px-5 py-4 hover:border-brand-500 hover:bg-brand-50 transition-colors"
          >
            <span className="text-2xl">🔷</span>
            <div className="text-left">
              <p className="font-semibold">Connect Meta Ads</p>
              <p className="text-xs text-gray-500">Authorize read access to your Meta Ads account</p>
            </div>
          </button>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now →
        </button>
      </div>
    </div>
  )
}
