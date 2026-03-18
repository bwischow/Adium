import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-xs text-white/40 tracking-widest">
            &copy; {new Date().getFullYear()} ADIUM
          </span>
          <span className="text-xs text-white/30 tracking-wide normal-case">
            Google Ads and Meta Ads supported. Additional platforms coming soon.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="text-xs text-white/30 hover:text-white/50 transition-colors tracking-widest"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-white/30 hover:text-white/50 transition-colors tracking-widest"
          >
            Terms
          </Link>
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
