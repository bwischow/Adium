export function LandingProblem() {
  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left — section label */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/40 mb-2 font-medium">01</p>
          <p className="text-xs tracking-widest text-white/50 font-medium">The Problem</p>
        </div>

        {/* Right — content */}
        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
            Most advertising benchmarks are useless.
          </h2>

          <div className="space-y-4 text-sm text-white/60 leading-relaxed max-w-xl normal-case">
            <p>Today&apos;s marketing benchmarks usually come from:</p>
            <ul className="space-y-1 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-white/30 mt-0.5">&#x2022;</span>
                <span>Blog posts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/30 mt-0.5">&#x2022;</span>
                <span>Annual industry reports</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/30 mt-0.5">&#x2022;</span>
                <span>Agency marketing studies</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 space-y-4 text-sm text-white/60 leading-relaxed max-w-xl normal-case">
            <p>They rarely account for:</p>
            <ul className="space-y-1 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-white/30 mt-0.5">&#x2022;</span>
                <span>Your industry</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/30 mt-0.5">&#x2022;</span>
                <span>Your budget</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/30 mt-0.5">&#x2022;</span>
                <span>Your campaign objectives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/30 mt-0.5">&#x2022;</span>
                <span>Your platform mix</span>
              </li>
            </ul>
          </div>

          <div className="mt-10 border-l-2 border-peach pl-6">
            <p className="text-lg md:text-xl font-bold text-white/70 leading-snug">
              So marketers are left guessing:
              <br />
              <span className="text-peach">Are my ads actually performing well?</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
