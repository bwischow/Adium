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

  return (
    <aside className="w-60 flex-shrink-0 bg-terminal border-r border-black flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-black">
        <span className="text-xs font-bold tracking-widest text-black">ADIUM</span>
      </div>

      {/* Company switcher */}
      <div className="px-5 pt-4">
        <p className="text-[10px] font-bold text-black/40 tracking-widest mb-2">Company</p>
        <select
          value={selectedCompanyId}
          onChange={e => onCompanyChange(e.target.value)}
          className="w-full text-xs border border-black bg-white px-3 py-2 focus:outline-none focus:border-peach text-black"
        >
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Link
          href="/companies/new"
          className="block text-[10px] text-black/50 hover:text-black mt-1 text-right tracking-widest font-medium"
        >
          + Add
        </Link>
      </div>

      {/* Ad account list */}
      <div className="px-5 pt-5 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-black/40 tracking-widest mb-2">
          Sources
        </p>
        {adAccounts.length === 0 ? (
          <p className="text-[10px] text-black/30 tracking-wide">None connected</p>
        ) : (
          <ul className="space-y-px">
            {adAccounts.map((a, i) => (
              <li key={a.id}>
                <button
                  onClick={() => onAccountChange(a.id)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    selectedAccountId === a.id
                      ? 'bg-black text-peach font-bold'
                      : 'text-black/60 hover:bg-black/5'
                  }`}
                >
                  <span className="text-[10px] font-bold opacity-40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="truncate tracking-wide">
                      {a.account_name || platformLabel(a.platform)}
                    </span>
                    <span className={`text-[9px] tracking-widest ${
                      selectedAccountId === a.id
                        ? 'text-peach/60'
                        : 'text-black/30'
                    }`}>
                      {platformLabel(a.platform)}
                    </span>
                  </span>
                  <span className={`ml-auto w-1.5 h-1.5 ${
                    selectedAccountId === a.id ? 'bg-peach' : 'bg-black/20'
                  }`} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/companies/${selectedCompanyId}/connect`}
          className="block text-[10px] text-black/50 hover:text-black mt-2 tracking-widest font-medium"
        >
          + Connect source
        </Link>
        <Link
          href={`/companies/${selectedCompanyId}/settings`}
          className="block text-[10px] text-black/50 hover:text-black mt-2 tracking-widest font-medium"
        >
          Settings
        </Link>
      </div>

      {/* Logout */}
      <div className="px-5 pb-4 border-t border-black pt-3">
        <button
          onClick={onLogout}
          className="w-full text-[10px] text-black/40 hover:text-black text-left tracking-widest font-medium"
        >
          Disconnect
        </button>
      </div>
    </aside>
  )
}
