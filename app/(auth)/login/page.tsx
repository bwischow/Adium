'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed. Please try again.')
        return
      }

      window.location.assign('/dashboard')
    } catch {
      setError('Unable to connect. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="border border-white/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-sm font-bold tracking-widest text-white">ADIUM</h1>
          <p className="text-xs text-white/30 mt-1 tracking-widest">Benchmark Intelligence System</p>
        </div>

        <div className="bg-terminal px-6 py-5 mb-6 border border-black">
          <h2 className="text-xs font-bold text-black tracking-widest">Log In</h2>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 mb-4 text-xs tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              placeholder="email@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-peach text-black py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark disabled:opacity-60 transition-colors"
          >
            {loading ? 'Logging in\u2026' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30 tracking-wide">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-peach hover:text-peach-dark font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
