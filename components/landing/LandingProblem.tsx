export function LandingProblem() {
  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left — section label */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium">01</p>
          <p className="text-xs tracking-widest text-white/50 font-medium">The Problem</p>
        </div>

        {/* Right — content */}
        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
            Benchmark data today is essentially useless.
          </h2>

          <div className="space-y-6 text-sm text-white/50 leading-relaxed max-w-xl">
            <p>
              Average CPC by industry, published in January, no context on spend
              level, conversion type, or even which year the data came from.
              You&apos;re left guessing what &ldquo;good&rdquo; looks like.
            </p>
            <p>
              Nobody segments by how much you spend, what you optimize for, or
              what industry you&apos;re actually in. Generic averages don&apos;t
              help anyone make real decisions.
            </p>
          </div>

          <div className="mt-10 border-l-2 border-peach pl-6">
            <p className="text-sm text-white/40 italic leading-relaxed">
              &ldquo;It doesn&apos;t help me to know a generic average CPC from
              a blog with no qualification on spend or conversions.&rdquo;
            </p>
          </div>

          <p className="mt-8 text-sm text-white/40 leading-relaxed">
            What if there was a system where every advertiser contributed
            anonymized data &mdash; and in return, got access to real benchmarks
            from their actual peers?
          </p>
        </div>
      </div>
    </section>
  )
}
