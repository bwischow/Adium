import Link from 'next/link'

export function LandingCTA() {
  return (
    <section className="border-b border-white/10">
      <div className="bg-black px-8 md:px-16 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-widest text-white/30 mb-6 font-medium">
            Initialize
          </p>

          <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Stop guessing.
            <br />
            Start&nbsp;knowing.
          </h2>

          <p className="text-sm text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
            Connect your ad accounts, contribute to the peer pool, and see
            where you actually stand — in minutes, not months.
          </p>

          <Link
            href="/signup"
            className="inline-block bg-peach text-black text-sm font-bold tracking-widest px-8 py-4 hover:bg-peach-dark transition-colors"
          >
            Start benchmarking
          </Link>
          <p className="mt-4 text-xs text-white/30 tracking-wide">
            Free to start. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
