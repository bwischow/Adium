import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-xs text-white/30 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} ADIUM
          </span>
          <span className="text-xs text-white/20 tracking-wide">
            Google Ads, Meta Ads, LinkedIn Ads, and TikTok Ads supported.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="text-xs text-white/30 hover:text-white/50 transition-colors tracking-widest uppercase"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-white/30 hover:text-white/50 transition-colors tracking-widest uppercase"
          >
            Terms
          </Link>
          <Link
            href="/support"
            className="text-xs text-white/30 hover:text-white/50 transition-colors tracking-widest uppercase"
          >
            Support
          </Link>
          <Link
            href="/login"
            className="text-xs text-white/40 hover:text-white/70 transition-colors tracking-widest uppercase"
          >
            Log in
          </Link>
        </div>
      </div>
    </footer>
  )
}
