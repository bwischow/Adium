'use client'

import { useState, useEffect, useCallback } from 'react'
import { INDUSTRIES } from '@/types'

export function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')

  const open = useCallback(() => setIsOpen(true), [])

  useEffect(() => {
    window.addEventListener('open-waitlist-modal', open)
    return () => window.removeEventListener('open-waitlist-modal', open)
  }, [open])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    setSubmitted(false)
    setName('')
    setEmail('')
    setCompany('')
    setIndustry('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative border border-white/20 bg-void p-8 w-full max-w-md mx-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-sm font-bold tracking-widest text-white">ADIUM</h1>
          <p className="text-xs text-white/30 mt-1 tracking-widest">Benchmark Intelligence System</p>
        </div>

        {submitted ? (
          <>
            <div className="bg-terminal px-6 py-5 mb-6 border border-black">
              <h2 className="text-xs font-bold text-black tracking-widest">You&apos;re On The List</h2>
            </div>

            <p className="text-sm text-white/60 mb-2">
              Thanks for your interest in Adium.
            </p>
            <p className="text-xs text-white/40 mb-8 leading-relaxed">
              We&apos;ll let you know when we&apos;re ready for you. Keep an eye on your inbox.
            </p>

            <button
              onClick={handleClose}
              className="w-full bg-peach text-black py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark transition-colors"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <div className="bg-peach px-6 py-5 mb-6 border border-black">
              <h2 className="text-xs font-bold text-black tracking-widest">Join The Waitlist</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  required
                  className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Industry</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  required
                  className="w-full border border-white/20 bg-void px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach appearance-none"
                >
                  <option value="" disabled className="bg-void text-white/40">
                    Select your industry
                  </option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind.id} value={ind.slug} className="bg-void text-white">
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-peach text-black py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark transition-colors"
              >
                Join The Waitlist
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
