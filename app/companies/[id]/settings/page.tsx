'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { INDUSTRIES, METRIC_LABELS } from '@/types'
import type { Company, AdAccount, MetricName } from '@/types'

type Tab = 'profile' | 'accounts' | 'notifications'

type MetricPrefs = Record<MetricName, boolean>
const ALL_METRICS: MetricName[] = ['cpc', 'cpm', 'ctr', 'roas', 'cpa', 'cpl']
const DEFAULT_PREFS: MetricPrefs = { cpc: true, cpm: true, ctr: true, roas: true, cpa: true, cpl: true }

const OTHER_INDUSTRY_ID = 8

export default function CompanySettingsPage() {
  const { id: companyId } = useParams<{ id: string }>()
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<Company | null>(null)
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])

  // Profile form state
  const [name, setName]                   = useState('')
  const [industryId, setIndustryId]       = useState(1)
  const [industryOther, setIndustryOther] = useState('')
  const [website, setWebsite]             = useState('')
  const [phone, setPhone]                 = useState('')
  const [email, setEmail]                 = useState('')
  const [saving, setSaving]               = useState(false)
  const [saveMessage, setSaveMessage]     = useState('')

  // Notification preferences state
  const [emailsEnabled, setEmailsEnabled]       = useState(true)
  const [driftAlerts, setDriftAlerts]           = useState<MetricPrefs>({ ...DEFAULT_PREFS })
  const [benchmarkAlerts, setBenchmarkAlerts]   = useState<MetricPrefs>({ ...DEFAULT_PREFS })
  const [notifLoading, setNotifLoading]         = useState(false)
  const [notifSaving, setNotifSaving]           = useState(false)
  const [notifMessage, setNotifMessage]         = useState('')

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
      setIndustryOther(data.industry_other || '')
      setWebsite(data.website || '')
      setPhone(data.phone || '')
      setEmail(data.email || '')
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationPrefs = async () => {
    setNotifLoading(true)
    try {
      const res = await fetch('/api/notifications/preferences')
      if (res.ok) {
        const data = await res.json()
        setEmailsEnabled(data.emails_enabled)
        setDriftAlerts(data.drift_alerts)
        setBenchmarkAlerts(data.benchmark_alerts)
      }
    } catch {
      // use defaults
    } finally {
      setNotifLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setNotifSaving(true)
    setNotifMessage('')
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails_enabled: emailsEnabled,
          drift_alerts: driftAlerts,
          benchmark_alerts: benchmarkAlerts,
        }),
      })
      if (res.ok) {
        setNotifMessage('Saved!')
        setTimeout(() => setNotifMessage(''), 3000)
      } else {
        const data = await res.json().catch(() => ({}))
        setNotifMessage(data.error || 'Failed to save.')
      }
    } catch {
      setNotifMessage('Network error.')
    } finally {
      setNotifSaving(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMessage('')
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          industry_id: industryId,
          industry_other: industryId === OTHER_INDUSTRY_ID ? industryOther.trim() : null,
          website,
          phone,
          email,
        }),
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
      <div className="min-h-screen flex items-center justify-center bg-void">
        <p className="text-sm text-white/40 tracking-widest">Loading...</p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <p className="text-sm text-red-400 tracking-widest">Company not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-2xl mx-auto pt-10 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-sm font-bold tracking-widest text-white">Company Settings</h1>
          <button
            onClick={() => router.push(`/dashboard?company=${companyId}`)}
            className="text-xs text-white/40 hover:text-peach tracking-widest transition-colors"
          >
            &larr; Back to dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border border-white/20 mb-8">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 text-xs font-bold py-3 tracking-widest transition-colors ${
              tab === 'profile'
                ? 'bg-peach text-black'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setTab('accounts')}
            className={`flex-1 text-xs font-bold py-3 tracking-widest transition-colors border-l border-white/20 ${
              tab === 'accounts'
                ? 'bg-peach text-black'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Connected Accounts
          </button>
          <button
            onClick={() => { setTab('notifications'); fetchNotificationPrefs() }}
            className={`flex-1 text-xs font-bold py-3 tracking-widest transition-colors border-l border-white/20 ${
              tab === 'notifications'
                ? 'bg-peach text-black'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Notifications
          </button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="border border-white/20 p-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Industry</label>
              <p className="text-[10px] text-white/30 mb-2 tracking-wide">If you are an agency, select the industry that best represents this client.</p>
              <select
                value={industryId}
                onChange={e => setIndustryId(Number(e.target.value))}
                className="w-full border border-white/20 bg-black px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>

            {industryId === OTHER_INDUSTRY_ID && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Describe Your Industry</label>
                <input
                  type="text"
                  value={industryOther}
                  onChange={e => setIndustryOther(e.target.value)}
                  placeholder="e.g. Pet supplies, Agriculture, etc."
                  className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
                />
                <p className="text-[10px] text-white/30 mt-1 tracking-wide">This helps us add new industry categories in the future.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Website</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving || !name.trim()}
                className="bg-peach text-black px-6 py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saveMessage && (
                <span className={`text-xs tracking-wide ${saveMessage === 'Saved!' ? 'text-terminal' : 'text-red-400'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Connected Accounts Tab */}
        {tab === 'accounts' && (
          <div className="border border-white/20 p-6">
            {adAccounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-white/40 mb-4 tracking-widest">No ad accounts connected yet.</p>
                <button
                  onClick={() => router.push(`/companies/${companyId}/connect`)}
                  className="bg-peach text-black px-5 py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark transition-colors"
                >
                  Connect an account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {adAccounts.map(account => (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between border px-4 py-3 ${
                      account.is_active
                        ? 'border-white/20'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{platformIcon(account.platform)}</span>
                      <div>
                        <p className={`font-medium text-sm ${!account.is_active ? 'text-white/40' : 'text-white'}`}>
                          {account.account_name || platformLabel(account.platform)}
                        </p>
                        <p className="text-xs text-white/40">
                          {platformLabel(account.platform)}
                          {!account.is_active && (
                            <span className="ml-2 text-orange-400 font-medium">Inactive</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === account.id ? null : account.id)}
                        className="text-white/40 hover:text-white px-2 py-1 hover:bg-white/10 transition-colors"
                      >
                        ⋯
                      </button>

                      {actionMenuId === account.id && (
                        <div className="absolute right-0 top-8 bg-black border border-white/20 shadow-lg py-1 w-52 z-10">
                          {account.is_active ? (
                            <button
                              onClick={() => { handleDeactivate(account.id); }}
                              disabled={actionLoading}
                              className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                            >
                              Deactivate
                              <p className="text-xs text-white/30">Stop pulling data, keep history</p>
                            </button>
                          ) : (
                            <button
                              onClick={() => { handleReactivate(account.id); }}
                              disabled={actionLoading}
                              className="w-full text-left px-4 py-2 text-sm text-terminal hover:bg-white/10"
                            >
                              Reactivate
                              <p className="text-xs text-white/30">Resume pulling data</p>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActionMenuId(null)
                              setConfirmAction({ accountId: account.id, action: 'disconnect', accountName: account.account_name || platformLabel(account.platform) })
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-white/10"
                          >
                            Disconnect
                            <p className="text-xs text-white/30">Remove account link</p>
                          </button>
                          <button
                            onClick={() => {
                              setActionMenuId(null)
                              setConfirmAction({ accountId: account.id, action: 'delete_all', accountName: account.account_name || platformLabel(account.platform) })
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10"
                          >
                            Delete account &amp; data
                            <p className="text-xs text-white/30">Permanently remove everything</p>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => router.push(`/companies/${companyId}/connect`)}
                  className="mt-4 text-xs text-peach hover:text-peach-dark tracking-widest"
                >
                  + Connect another account
                </button>
              </div>
            )}
          </div>
        )}
        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div className="border border-white/20 p-6 space-y-6">
            {notifLoading ? (
              <p className="text-xs text-white/40 tracking-widest">Loading preferences...</p>
            ) : (
              <>
                <p className="text-[10px] text-white/30 tracking-wide">
                  These preferences apply to all your companies and ad accounts.
                </p>

                {/* Global toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${emailsEnabled ? 'bg-peach' : 'bg-white/20'}`}
                    onClick={() => setEmailsEnabled(!emailsEnabled)}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${emailsEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-white">Email Notifications</span>
                </label>

                {emailsEnabled && (
                  <>
                    {/* Drift Alerts */}
                    <div>
                      <p className="text-xs font-bold tracking-widest text-white mb-1">Drift Alerts</p>
                      <p className="text-[10px] text-white/30 tracking-wide mb-4">
                        Get notified when a metric moves 20%+ outside your benchmark.
                      </p>
                      <div className="space-y-2">
                        {ALL_METRICS.map(metric => (
                          <label key={`drift-${metric}`} className="flex items-center justify-between py-2 px-3 border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                            <span className="text-xs text-white/60 tracking-widest">{METRIC_LABELS[metric]}</span>
                            <div
                              className={`relative w-8 h-4 rounded-full transition-colors ${driftAlerts[metric] ? 'bg-peach' : 'bg-white/20'}`}
                              onClick={() => setDriftAlerts(prev => ({ ...prev, [metric]: !prev[metric] }))}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-transform ${driftAlerts[metric] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Benchmark Alerts */}
                    <div>
                      <p className="text-xs font-bold tracking-widest text-white mb-1">New Benchmark Alerts</p>
                      <p className="text-[10px] text-white/30 tracking-wide mb-4">
                        Daily summary when fresh benchmark data is available.
                      </p>
                      <div className="space-y-2">
                        {ALL_METRICS.map(metric => (
                          <label key={`bench-${metric}`} className="flex items-center justify-between py-2 px-3 border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                            <span className="text-xs text-white/60 tracking-widest">{METRIC_LABELS[metric]}</span>
                            <div
                              className={`relative w-8 h-4 rounded-full transition-colors ${benchmarkAlerts[metric] ? 'bg-peach' : 'bg-white/20'}`}
                              onClick={() => setBenchmarkAlerts(prev => ({ ...prev, [metric]: !prev[metric] }))}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-transform ${benchmarkAlerts[metric] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={notifSaving}
                    className="bg-peach text-black px-6 py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {notifSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {notifMessage && (
                    <span className={`text-xs tracking-wide ${notifMessage === 'Saved!' ? 'text-terminal' : 'text-red-400'}`}>
                      {notifMessage}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="border border-white/20 bg-void p-6 w-full max-w-md mx-4">
            <div className="bg-red-900/30 border border-red-500/50 px-4 py-3 mb-4">
              <h2 className="text-xs font-bold tracking-widest text-red-400">
                {confirmAction.action === 'delete_all' ? 'Delete Account & All Data?' : 'Disconnect Account?'}
              </h2>
            </div>
            <p className="text-sm text-white mb-1">
              {confirmAction.accountName}
            </p>
            <p className="text-xs text-white/40 mb-6 tracking-wide">
              {confirmAction.action === 'delete_all'
                ? 'This will permanently delete the ad account and all its historical metrics data. This cannot be undone.'
                : 'This will remove the ad account connection. Historical metrics data will also be removed.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 border border-white/20 py-2.5 text-xs font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-colors"
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
                className={`flex-1 py-2.5 text-xs font-bold tracking-widest text-black transition-colors disabled:opacity-50 ${
                  confirmAction.action === 'delete_all'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {actionLoading ? 'Processing...' : confirmAction.action === 'delete_all' ? 'Delete Everything' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
