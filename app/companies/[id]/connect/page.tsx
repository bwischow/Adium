'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AdAccount {
  id:   string
  name: string
}

type PlatformStep = 'google-select' | 'meta-select' | 'linkedin-select' | 'tiktok-select'

const PLATFORM_CONFIG: Record<PlatformStep, { label: string; accountsUrl: string; selectUrl: string; noAccountsMsg: string }> = {
  'google-select': {
    label:          'Google Ads',
    accountsUrl:    '/api/connect/google/accounts',
    selectUrl:      '/api/connect/google/select',
    noAccountsMsg:  'No Google Ads accounts found for this Google account.',
  },
  'meta-select': {
    label:          'Meta Ads',
    accountsUrl:    '/api/connect/meta/accounts',
    selectUrl:      '/api/connect/meta/select',
    noAccountsMsg:  'No Meta Ads accounts found for this Meta account.',
  },
  'linkedin-select': {
    label:          'LinkedIn Ads',
    accountsUrl:    '/api/connect/linkedin/accounts',
    selectUrl:      '/api/connect/linkedin/select',
    noAccountsMsg:  'No LinkedIn Ads accounts found for this LinkedIn account.',
  },
  'tiktok-select': {
    label:          'TikTok Ads',
    accountsUrl:    '/api/connect/tiktok/accounts',
    selectUrl:      '/api/connect/tiktok/select',
    noAccountsMsg:  'No TikTok Ads accounts found for this TikTok account.',
  },
}

const ERROR_MESSAGES: Record<string, string> = {
  token_exchange_failed:    'Failed to complete authentication. Please try again.',
  list_accounts_failed:     'Could not retrieve your ad accounts. Make sure your account has the correct access.',
  no_accounts_found:        'No ad accounts were found for this account.',
  no_ad_accounts:           'All accounts associated with this login are manager (MCC) accounts. Please sign in with a Google account that directly owns ad-serving accounts.',
  session_storage_failed:   'An internal error occurred. Please try again.',
  long_lived_token_failed:  'Failed to obtain a long-lived token from Meta. Please try again.',
  linkedin_scope_denied:    'LinkedIn did not grant the required advertising permissions. Ensure your app has Marketing Developer Platform access.',
  tiktok_auth_failed:       'TikTok authentication failed. Please try again.',
}

export default function ConnectAccountPage() {
  const { id: companyId } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const step        = searchParams.get('step') as PlatformStep | null
  const sessionId   = searchParams.get('session')
  const status      = searchParams.get('status')
  const errorReason = searchParams.get('error_reason')
  const errorDetail = searchParams.get('error_detail')

  // --- Account selection state (shared by Google & Meta) ---
  const [accounts, setAccounts]               = useState<AdAccount[]>([])
  const [selectedIds, setSelectedIds]         = useState<string[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [submitting, setSubmitting]           = useState(false)
  const [fetchError, setFetchError]           = useState('')
  const [syncError, setSyncError]             = useState('')

  const platformConfig = step ? PLATFORM_CONFIG[step] : null

  useEffect(() => {
    if (!platformConfig || !sessionId) return

    setLoadingAccounts(true)
    setFetchError('')
    fetch(`${platformConfig.accountsUrl}?session=${sessionId}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}))
          throw new Error(data.error || `Failed to load accounts (${r.status})`)
        }
        return r.json()
      })
      .then(data => {
        if (Array.isArray(data.accounts) && data.accounts.length > 0) {
          setAccounts(data.accounts)
          setSelectedIds([])
        } else {
          setFetchError(platformConfig.noAccountsMsg)
        }
      })
      .catch((err) => {
        setFetchError(err.message || 'Failed to load accounts.')
      })
      .finally(() => setLoadingAccounts(false))
  }, [step, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAccount = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleConfirmAccounts = async () => {
    if (!platformConfig || selectedIds.length === 0 || submitting || !sessionId) return
    setSubmitting(true)
    setSyncError('')
    try {
      const res = await fetch(platformConfig.selectUrl, {
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

  const handleConnect = (platform: 'google' | 'meta' | 'linkedin' | 'tiktok') => {
    window.location.href = `/api/connect/${platform}/start?company_id=${companyId}`
  }

  // --- Account selection screen (Google or Meta) ---
  if (platformConfig && sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="border border-white/20 p-8 w-full max-w-lg">
          <div className="bg-terminal px-6 py-5 mb-6 border border-black">
            <h1 className="text-xs font-bold text-black tracking-widest">Select Sources</h1>
          </div>

          <p className="text-xs text-white/40 mb-6 tracking-wide">
            Select the {platformConfig.label} accounts you want to connect.
          </p>

          {fetchError && (
            <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-400 text-xs px-4 py-3 tracking-wide">
              {fetchError}
            </div>
          )}

          {syncError && (
            <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-400 text-xs px-4 py-3 tracking-wide">
              {syncError}
            </div>
          )}

          {loadingAccounts ? (
            <p className="text-xs text-white/30 tracking-widest">Loading accounts...</p>
          ) : accounts.length === 0 && !fetchError ? (
            <p className="text-xs text-white/40">{platformConfig.noAccountsMsg}</p>
          ) : accounts.length > 0 ? (
            <div className="space-y-px mb-6 border border-white/20">
              {accounts.map(account => (
                <label
                  key={account.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    selectedIds.includes(account.id)
                      ? 'bg-terminal/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                    className="w-4 h-4 accent-peach"
                  />
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">{account.name}</p>
                    <p className="text-[10px] text-white/30 tracking-widest">ID: {account.id}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : null}

          {accounts.length > 0 && (
            <button
              onClick={handleConfirmAccounts}
              disabled={selectedIds.length === 0 || submitting || loadingAccounts}
              className="w-full bg-peach text-black py-3 text-xs font-bold tracking-widest hover:bg-peach-dark disabled:opacity-50 transition-colors"
            >
              {submitting
                ? 'Connecting...'
                : `Sync ${selectedIds.length} source${selectedIds.length !== 1 ? 's' : ''}`}
            </button>
          )}

          <button
            onClick={() => router.push(`/companies/${companyId}/connect`)}
            className="mt-3 w-full text-xs text-white/30 hover:text-white/60 tracking-widest"
          >
            &larr; Back
          </button>
        </div>
      </div>
    )
  }

  // --- Platform selection screen ---
  const isSuccess = status === 'success'
  const errorMessage = status === 'error'
    ? (errorReason && ERROR_MESSAGES[errorReason]) || 'Something went wrong connecting your account. Please try again.'
    : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="border border-white/20 p-8 w-full max-w-lg">
        <div className="bg-peach px-6 py-5 mb-6 border border-black">
          <h1 className="text-xs font-bold text-black tracking-widest">Connect System Inputs</h1>
        </div>

        <p className="text-xs text-white/40 mb-8 tracking-wide">
          Connect an ad platform account to start benchmarking.
        </p>

        {isSuccess && (
          <div className="mb-6 bg-terminal/20 border border-terminal text-terminal text-xs px-4 py-3 tracking-wide">
            <p className="font-bold">Source connected successfully.</p>
            <p className="mt-1 text-terminal/70">Connect another source below, or return to the dashboard.</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 text-xs px-4 py-3 tracking-wide">
            <p>{errorMessage}</p>
            {errorDetail && (
              <p className="mt-1 text-[10px] text-red-500/70 font-mono">Detail: {errorDetail}</p>
            )}
          </div>
        )}

        <div className="space-y-px border border-white/20">
          <button
            onClick={() => handleConnect('google')}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/10"
          >
            <div className="w-8 h-8 bg-terminal flex items-center justify-center">
              <span className="text-xs font-bold text-black">G</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white tracking-widest">Google Ads</p>
              <p className="text-[10px] text-white/30 tracking-wide">Authorize read access</p>
            </div>
            <span className="ml-auto text-xs text-white/20">&rarr;</span>
          </button>

          <button
            onClick={() => handleConnect('meta')}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/10"
          >
            <div className="w-8 h-8 bg-peach flex items-center justify-center">
              <span className="text-xs font-bold text-black">M</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white tracking-widest">Meta Ads</p>
              <p className="text-[10px] text-white/30 tracking-wide">Authorize read access</p>
            </div>
            <span className="ml-auto text-xs text-white/20">&rarr;</span>
          </button>

          <div
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-white/10 opacity-50 cursor-default"
          >
            <div className="w-8 h-8 bg-[#0A66C2] flex items-center justify-center">
              <span className="text-xs font-bold text-white">Li</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white tracking-widest">LinkedIn Ads</p>
              <p className="text-[10px] text-white/30 tracking-wide">Authorize read access</p>
            </div>
            <span className="ml-auto text-[10px] text-white/40 tracking-widest uppercase font-medium">Coming soon</span>
          </div>

          <div
            className="w-full flex items-center gap-4 px-5 py-4 opacity-50 cursor-default"
          >
            <div className="w-8 h-8 bg-black flex items-center justify-center border border-white/20">
              <span className="text-xs font-bold text-white">Tk</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white tracking-widest">TikTok Ads</p>
              <p className="text-[10px] text-white/30 tracking-wide">Authorize read access</p>
            </div>
            <span className="ml-auto text-[10px] text-white/40 tracking-widest uppercase font-medium">Coming soon</span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/dashboard?company=${companyId}`)}
          className="mt-6 w-full text-xs text-white/30 hover:text-white/60 tracking-widest"
        >
          {isSuccess ? '\u2190 Back to dashboard' : 'Skip for now \u2192'}
        </button>
      </div>
    </div>
  )
}
