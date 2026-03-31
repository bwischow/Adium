import { AnimatedHeading } from './AnimatedHeading'

export function LandingNetwork() {
  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium uppercase">05</p>
          <p className="text-xs tracking-widest text-white/50 font-medium uppercase">Network Effect</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <AnimatedHeading
            as="h2"
            animateOnScroll
            balance
            text="Benchmarks improve as the network grows."
            className="text-3xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-8"
          />

          <div className="space-y-4 text-base md:text-lg text-white/50 leading-relaxed max-w-2xl">
            <p>Every connected advertiser strengthens the dataset.</p>
            <p>
              More advertisers &rarr; more segmentation &rarr; better benchmarks.
            </p>
            <p>
              Adium becomes more valuable every time someone connects their account.
            </p>
          </div>

          <div className="mt-10 border-l-2 border-terminal pl-6">
            <p className="text-base text-white/60 leading-relaxed italic">
              Think Glassdoor for ad performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
