import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="px-6 py-4 flex items-center justify-between">
        <span className="text-xs text-white/30 tracking-widest">
          &copy; {new Date().getFullYear()} ADIUM
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/20 tracking-widest">
            Benchmark Intelligence System
          </span>
          <Link
            href="/login"
            className="text-xs text-white/40 hover:text-white/70 transition-colors tracking-widest"
          >
            Log in
          </Link>
        </div>
      </div>
    </footer>
  )
}
