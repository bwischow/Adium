'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface GoogleAccount {
  id:   string
  name: string
}

const ERROR_MESSAGES: Record<string, string> = {
  token_exchange_failed:  'Failed to complete Google authentication. Please try again.',
  list_accounts_failed:   'Could not retrieve your Google Ads accounts. Make sure your Google account has access to Google Ads.',
  no_accounts_found:      'No Google Ads accounts were found for this Google account.',
  no_ad_accounts:         'All accounts associated with this login are manager (MCC) accounts. Please sign in with a Google account that directly owns ad-serving accounts.',
  session_storage_failed: 'An internal error occurred. Please try again.',
}

export default function ConnectAccountPage() {
  const { id: companyId } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const step        = searchParams.get('step')
  const sessionId   = searchParams.get('session')
  const status      = searchParams.get('status')
  const errorReason = searchParams.get('error_reason')
  const errorDetail = searchParams.get('error_detail')

  // --- Google account selection state ---
  const [googleAccounts, setGoogleAccounts]   = useState<GoogleAccount[]>([])
  const [selectedIds, setSelectedIds]         = useState<string[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [submitting, setSubmitting]           = useState(false)
  const [fetchError, setFetchError]           = useState('')
  const [syncError, setSyncError]             = useState('')

  useEffect(() => {
    if (step === 'google-select' && sessionId) {
      setLoadingAccounts(true)
      setFetchError('')
      fetch(`/api/connect/google/accounts?session=${sessionId}`)
        .then(async (r) => {
          if (!r.ok) {
            const data = await r.json().catch(() => ({}))
            throw new Error(data.error || `Failed to load accounts (${r.status})`)
          }
          return r.json()
        })
        .then(data => {
          if (Array.isArray(data.accounts) && data.accounts.length > 0) {
            setGoogleAccounts(data.accounts)
            setSelectedIds(data.accounts.map((a: GoogleAccount) => a.id))
          } else {
            setFetchError('No Google Ads accounts found for this Google account.')
          }
        })
        .catch((err) => {
          setFetchError(err.message || 'Failed to load accounts.')
        })
        .finally(() => setLoadingAccounts(false))
    }
  }, [step, sessionId])

  const toggleAccount = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleConfirmAccounts = async () => {
    if (selectedIds.length === 0 || submitting || !sessionId) return
    setSubmitting(true)
    setSyncError('')
    try {
      const res = await fetch('/api/connect/google/select', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ selectedIds, sessionId }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/dashboard?company=${data.companyId || companyId}`)
      } else {
        const data = await res.json().catch(() => ({}))
        setSyncError(data.error || 'Failed to sync accounts. Please try again.')
      }
    } catch {
      setSyncError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConnect = (platform: 'google' | 'meta') => {
    window.location.href = `/api/connect/${platform}/start?company_id=${companyId}`
  }

  // --- Google account selection screen ---
  if (step === 'google-select' && sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-2">Choose accounts to sync</h1>
          <p className="text-gray-500 text-sm mb-6">
            Select the Google Ads accounts you want to connect to this company.
          </p>

          {fetchError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {fetchError}
            </div>
          )}

          {syncError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {syncError}
            </div>
          )}

          {loadingAccounts ? (
            <p className="text-sm text-gray-400">Loading accounts...</p>
          ) : googleAccounts.length === 0 && !fetchError ? (
            <p className="text-sm text-gray-500">No Google Ads accounts found for this Google account.</p>
          ) : googleAccounts.length > 0 ? (
            <div className="space-y-2 mb-6">
              {googleAccounts.map(account => (
                <label
                  key={account.id}
                  className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <div>
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-gray-400">ID: {account.id}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : null}

          {googleAccounts.length > 0 && (
            <button
              onClick={handleConfirmAccounts}
              disabled={selectedIds.length === 0 || submitting || loadingAccounts}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting
                ? 'Connecting...'
                : `Sync ${selectedIds.length} account${selectedIds.length !== 1 ? 's' : ''}`}
            </button>
          )}

          <button
            onClick={() => router.push(`/companies/${companyId}/connect`)}
            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
        </div>
      </div>
    )
  }

  // --- Platform selection screen ---
  const errorMessage = status === 'error'
    ? (errorReason && ERROR_MESSAGES[errorReason]) || 'Something went wrong connecting your account. Please try again.'
    : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Connect an ad account</h1>
        <p className="text-gray-500 text-sm mb-8">
          Connect at least one Google Ads or Meta Ads account so we can pull
          your data and start benchmarking.
        </p>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <p>{errorMessage}</p>
            {errorDetail && (
              <p className="mt-1 text-xs text-red-500 font-mono">Detail: {errorDetail}</p>
            )}
          </div>
        )}

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
          Skip for now &rarr;
        </button>
      </div>
    </div>
  )
}
