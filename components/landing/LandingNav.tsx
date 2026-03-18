'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
        scrolled || menuOpen ? 'bg-black/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-sm font-bold tracking-widest text-white">
          ADIUM
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-xs tracking-widest text-white/60 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-xs tracking-widest text-white/60 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-xs tracking-widest bg-peach text-black px-5 py-2 hover:bg-peach-dark transition-colors font-medium"
          >
            Get started
          </Link>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <Link
            href="/signup"
            className="text-xs tracking-widest bg-peach text-black px-5 py-2 hover:bg-peach-dark transition-colors font-medium"
          >
            Get started
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l10 10M14 4L4 14" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 5h14M2 9h14M2 13h14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-b border-white/10 bg-black/95 backdrop-blur-sm">
          <div className="flex flex-col px-6 py-4 gap-4">
            <Link
              href="/pricing"
              onClick={() => setMenuOpen(false)}
              className="text-xs tracking-widest text-white/60 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-xs tracking-widest text-white/60 hover:text-white transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
