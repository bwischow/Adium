'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [fullName, setFullName]            = useState('')
  const [email, setEmail]                  = useState('')
  const [password, setPassword]            = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError]                  = useState('')
  const [loading, setLoading]              = useState(false)
  const [success, setSuccess]              = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

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
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="border border-white/20 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-sm font-bold tracking-widest text-white">ADIUM</h1>
            <p className="text-xs text-white/30 mt-1 tracking-widest">Benchmark Intelligence System</p>
          </div>

          <div className="bg-terminal px-6 py-5 mb-6 border border-black">
            <h2 className="text-xs font-bold text-black tracking-widest">Check Your Email</h2>
          </div>

          <p className="text-sm text-white/60 mb-2">
            We sent a confirmation link to:
          </p>
          <p className="text-sm text-peach font-medium mb-6">{email}</p>
          <p className="text-xs text-white/40 mb-8 leading-relaxed">
            Click the link in the email to activate your account, then come back here to log in. If you don&apos;t see it, check your spam folder.
          </p>

          <Link
            href="/login"
            className="block w-full bg-peach text-black py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark transition-colors text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
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
              minLength={6}
              disabled={loading}
              className="w-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20"
              placeholder="********"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 tracking-widest">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className={`w-full border bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none focus:border-peach placeholder:text-white/20 ${
                confirmPassword && confirmPassword !== password
                  ? 'border-red-500/50'
                  : 'border-white/20'
              }`}
              placeholder="********"
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="text-[10px] text-red-400 mt-1 tracking-wide">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || (!!confirmPassword && confirmPassword !== password)}
            className="w-full bg-peach text-black py-2.5 text-xs font-bold tracking-widest hover:bg-peach-dark disabled:opacity-60 transition-colors"
          >
            {loading ? 'Creating Account\u2026' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30 tracking-wide">
          Already have an account?{' '}
          <Link href="/login" className="text-peach hover:text-peach-dark font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
