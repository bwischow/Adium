'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  useEffect(() => {
    console.log('[Login Page] Component mounted')
  }, [])

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('[Login Page] Submitting login...')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      console.log('[Login Page] Response:', {
        status: response.status,
        ok: response.ok,
        data,
      })

      if (!response.ok) {
        const errorCode = data.code || 'UNKNOWN_ERROR'
        const errorMessage = data.error || 'Login failed'

        console.log('[Login Page] ERROR:', { code: errorCode, message: errorMessage })
        setError(`[${errorCode}] ${errorMessage}`)
        return
      }

      console.log('[Login Page] SUCCESS! Navigating to dashboard...')
      window.location.assign('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      console.log('[Login Page] EXCEPTION:', errorMessage)
      setError(`[NETWORK_ERROR] ${errorMessage}`)
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
          <h2 className="text-xs font-bold text-black tracking-widest">System Access</h2>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 mb-4 text-xs tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Identifier</label>
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
            <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Access Key</label>
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
            {loading ? 'Authenticating\u2026' : 'Authenticate'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30 tracking-wide">
          No account?{' '}
          <Link href="/signup" className="text-peach hover:text-peach-dark font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
