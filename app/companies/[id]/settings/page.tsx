'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { INDUSTRIES } from '@/types'
import type { Company, AdAccount } from '@/types'

type Tab = 'profile' | 'accounts'

export default function CompanySettingsPage() {
  const { id: companyId } = useParams<{ id: string }>()
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<Company | null>(null)
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])

  // Profile form state
  const [name, setName]               = useState('')
  const [industryId, setIndustryId]   = useState(1)
  const [website, setWebsite]         = useState('')
  const [phone, setPhone]             = useState('')
  const [email, setEmail]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Account action state
  const [actionMenuId, setActionMenuId]     = useState<string | null>(null)
  const [confirmAction, setConfirmAction]   = useState<{ accountId: string; action: string; accountName: string } | null>(null)
  const [actionLoading, setActionLoading]   = useState(false)

  useEffect(() => {
    fetchCompany()
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCompany = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/companies/${companyId}`)
      if (!res.ok) throw new Error('Failed to load company')
      const data = await res.json()
      setCompany(data)
      setAdAccounts(data.ad_accounts ?? [])
      setName(data.name || '')
      setIndustryId(data.industry_id || 1)
      setWebsite(data.website || '')
      setPhone(data.phone || '')
      setEmail(data.email || '')
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMessage('')
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry_id: industryId, website, phone, email }),
      })
      if (res.ok) {
        setSaveMessage('Saved!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        const data = await res.json().catch(() => ({}))
        setSaveMessage(data.error || 'Failed to save.')
      }
    } catch {
      setSaveMessage('Network error.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (accountId: string) => {
    setActionLoading(true)
    try {
      await fetch(`/api/accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })
      await fetchCompany()
    } finally {
      setActionLoading(false)
      setActionMenuId(null)
    }
  }

  const handleReactivate = async (accountId: string) => {
    setActionLoading(true)
    try {
      await fetch(`/api/accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      })
      await fetchCompany()
    } finally {
      setActionLoading(false)
      setActionMenuId(null)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    setActionLoading(true)
    try {
      await fetch(`/api/accounts/${accountId}?mode=disconnect`, { method: 'DELETE' })
      await fetchCompany()
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handleDeleteAll = async (accountId: string) => {
    setActionLoading(true)
    try {
      await fetch(`/api/accounts/${accountId}?mode=delete_all`, { method: 'DELETE' })
      await fetchCompany()
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const platformLabel = (p: string) => p === 'google_ads' ? 'Google Ads' : 'Meta Ads'
  const platformIcon  = (p: string) => p === 'google_ads' ? '🔵' : '🔷'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-red-500">Company not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-10 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Company Settings</h1>
          <button
            onClick={() => router.push(`/dashboard?company=${companyId}`)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors ${
              tab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setTab('accounts')}
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors ${
              tab === 'accounts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Connected Accounts
          </button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={industryId}
                onChange={e => setIndustryId(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving || !name.trim()}
                className="bg-blue-600 text-white rounded-xl px-6 py-2.5 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {saveMessage && (
                <span className={`text-sm ${saveMessage === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Connected Accounts Tab */}
        {tab === 'accounts' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {adAccounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-4">No ad accounts connected yet.</p>
                <button
                  onClick={() => router.push(`/companies/${companyId}/connect`)}
                  className="bg-blue-600 text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  Connect an account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {adAccounts.map(account => (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between border rounded-xl px-4 py-3 ${
                      account.is_active
                        ? 'border-gray-200'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{platformIcon(account.platform)}</span>
                      <div>
                        <p className={`font-medium text-sm ${!account.is_active ? 'text-gray-400' : ''}`}>
                          {account.account_name || platformLabel(account.platform)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {platformLabel(account.platform)}
                          {!account.is_active && (
                            <span className="ml-2 text-orange-500 font-medium">Inactive</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === account.id ? null : account.id)}
                        className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        ⋯
                      </button>

                      {actionMenuId === account.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-52 z-10">
                          {account.is_active ? (
                            <button
                              onClick={() => { handleDeactivate(account.id); }}
                              disabled={actionLoading}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Deactivate
                              <p className="text-xs text-gray-400">Stop pulling data, keep history</p>
                            </button>
                          ) : (
                            <button
                              onClick={() => { handleReactivate(account.id); }}
                              disabled={actionLoading}
                              className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                            >
                              Reactivate
                              <p className="text-xs text-gray-400">Resume pulling data</p>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActionMenuId(null)
                              setConfirmAction({ accountId: account.id, action: 'disconnect', accountName: account.account_name || platformLabel(account.platform) })
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                          >
                            Disconnect
                            <p className="text-xs text-gray-400">Remove account link</p>
                          </button>
                          <button
                            onClick={() => {
                              setActionMenuId(null)
                              setConfirmAction({ accountId: account.id, action: 'delete_all', accountName: account.account_name || platformLabel(account.platform) })
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                          >
                            Delete account &amp; data
                            <p className="text-xs text-gray-400">Permanently remove everything</p>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => router.push(`/companies/${companyId}/connect`)}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  + Connect another account
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-2">
              {confirmAction.action === 'delete_all' ? 'Delete account & all data?' : 'Disconnect account?'}
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium text-gray-700">{confirmAction.accountName}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {confirmAction.action === 'delete_all'
                ? 'This will permanently delete the ad account and all its historical metrics data. This cannot be undone.'
                : 'This will remove the ad account connection. Historical metrics data will also be removed.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.action === 'delete_all') {
                    handleDeleteAll(confirmAction.accountId)
                  } else {
                    handleDisconnect(confirmAction.accountId)
                  }
                }}
                disabled={actionLoading}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                  confirmAction.action === 'delete_all'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {actionLoading ? 'Processing...' : confirmAction.action === 'delete_all' ? 'Delete everything' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
