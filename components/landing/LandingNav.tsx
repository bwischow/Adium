'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
        scrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-sm font-bold tracking-widest text-white">
          ADIUM
        </Link>
        <div className="flex items-center gap-6">
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
      </div>
    </nav>
  )
}
