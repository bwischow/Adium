'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [fullName, setFullName]  = useState('')
  const [email, setEmail]        = useState('')
  const [password, setPassword]  = useState('')
  const [error, setError]        = useState('')
  const [loading, setLoading]    = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/companies/new')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="border border-white/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-sm font-bold tracking-widest text-white">ADIUM</h1>
          <p className="text-xs text-white/30 mt-1 tracking-widest">Benchmark Intelligence System</p>
        </div>

        <div className="bg-peach px-6 py-5 mb-6 border border-black">
          <h2 className="text-xs font-bold text-black tracking-widest">Create Account</h2>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 mb-4 text-xs tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={loading}
              className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              placeholder="Jane Smith"
            />
          </div>
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
              minLength={6}
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
            {loading ? 'Initializing\u2026' : 'Initialize Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30 tracking-wide">
          Already registered?{' '}
          <Link href="/login" className="text-peach hover:text-peach-dark font-medium">
            Authenticate
          </Link>
        </p>
      </div>
    </div>
  )
}
