'use client'

import Link from 'next/link'
import type { Company, AdAccount } from '@/types'

interface Props {
  companies: Company[]
  selectedCompanyId: string
  adAccounts: AdAccount[]
  selectedAccountId: string
  onCompanyChange: (id: string) => void
  onAccountChange: (id: string) => void
  onLogout: () => void
}

export default function CompanySidebar({
  companies,
  selectedCompanyId,
  adAccounts,
  selectedAccountId,
  onCompanyChange,
  onAccountChange,
  onLogout,
}: Props) {
  const platformLabel = (p: string) => p === 'google_ads' ? 'Google Ads' : 'Meta Ads'
  const platformIcon  = (p: string) => p === 'google_ads' ? '🔵' : '🔷'

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-brand-600">Adium</span>
      </div>

      {/* Company switcher */}
      <div className="px-5 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Company</p>
        <select
          value={selectedCompanyId}
          onChange={e => onCompanyChange(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Link
          href="/companies/new"
          className="block text-xs text-brand-600 hover:underline mt-1 text-right"
        >
          + Add company
        </Link>
      </div>

      {/* Ad account list */}
      <div className="px-5 pt-5 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Ad accounts
        </p>
        {adAccounts.length === 0 ? (
          <p className="text-xs text-gray-400">None connected yet</p>
        ) : (
          <ul className="space-y-1">
            {adAccounts.map(a => (
              <li key={a.id}>
                <button
                  onClick={() => onAccountChange(a.id)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedAccountId === a.id
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{platformIcon(a.platform)}</span>
                  <span className="truncate">{a.account_name || platformLabel(a.platform)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Logout */}
      <div className="px-5 pb-4 border-t border-gray-100 pt-3">
        <button
          onClick={onLogout}
          className="w-full text-sm text-gray-500 hover:text-gray-700 text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
