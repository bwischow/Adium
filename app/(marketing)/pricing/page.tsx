import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Pricing - Adium',
  description:
    'Adium rewards early adopters with lifetime pricing. The first 50 users get free access forever. Join the ad benchmarking network.',
  openGraph: {
    title: 'Pricing - Adium',
    description:
      'Early adopters lock in the lowest price forever. Connect your ad accounts and benchmark against real advertisers.',
    type: 'website',
  },
}

export default function PricingPage() {
  return (
    <>
      <LandingNav />
      <PricingHero />
      <PricingTiers />
      <PricingPhilosophy />
      <PricingIncludes />
      <PricingDayPass />
      <PricingCTA />
      <LandingFooter />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function PricingHero() {
  return (
    <section className="pt-16">
      <div className="bg-peach px-8 md:px-16 py-20 md:py-24 text-center">
        <p className="text-xs tracking-widest text-black/40 mb-8 font-medium uppercase">
          Pricing
        </p>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-[0.95] tracking-tight mb-8 max-w-3xl mx-auto">
          Early believers
          <br />
          pay less. Forever.
        </h1>

        <p className="text-base md:text-lg text-black/50 max-w-xl mx-auto leading-relaxed">
          Adium gets better with every user who joins. So we reward the people
          who take an early bet on us with the best price, locked in for life.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Tier cards                                                         */
/* ------------------------------------------------------------------ */

function PricingTiers() {
  return (
    <section className="border-b border-white/10">
      <div className="px-8 md:px-12 py-6 border-b border-white/10">
        <p className="text-xs tracking-widest text-white/30 font-medium uppercase">
          Contributor Tiers
        </p>
      </div>

      <div className="px-8 md:px-12 py-8 border-b border-white/10">
        <h2 className="text-2xl md:text-3xl font-black text-white leading-[1.05] tracking-tight">
          Your rate is locked the moment you sign up.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <TierCard
          number="01"
          label="Founding Members"
          spots="First 50 users"
          price="Free"
          priceDetail="Forever"
          highlight="Locked in for life"
          bg="bg-peach"
          dark={false}
        />
        <TierCard
          number="02"
          label="Early Adopters"
          spots="Users 51 – 200"
          price="$10"
          priceDetail="/ month · lifetime rate"
          highlight="Rate never increases"
          bg="bg-terminal"
          dark={false}
        />
        <TierCard
          number="03"
          label="Growth"
          spots="Users 201 – 350"
          price="$20"
          priceDetail="/ month · lifetime rate"
          highlight="Still early"
          bg="bg-white"
          dark={false}
        />
        <TierCard
          number="04"
          label="Standard"
          spots="350 +"
          price="~$50"
          priceDetail="/ month · maximum cap"
          highlight="Data contributors"
          bg="bg-white/5"
          dark
        />
      </div>

      <div className="px-8 md:px-12 py-6 border-t border-white/10">
        <p className="text-xs text-white/30 tracking-wide">
          Price increases every 150 users ($30, $40, …) and caps at $50/month.
          Connect your ad accounts and your rate is locked permanently.
        </p>
      </div>
    </section>
  )
}

function TierCard({
  number,
  label,
  spots,
  price,
  priceDetail,
  highlight,
  bg,
  dark,
}: {
  number: string
  label: string
  spots: string
  price: string
  priceDetail: string
  highlight: string
  bg: string
  dark: boolean
}) {
  const text = dark ? 'text-white' : 'text-black'
  const textMuted = dark ? 'text-white/40' : 'text-black/40'
  const textSoft = dark ? 'text-white/60' : 'text-black/60'
  const textFaint = dark ? 'text-white/30' : 'text-black/30'

  return (
    <div className={`${bg} ${dark ? 'border border-white/10' : ''} px-8 py-10 flex flex-col`}>
      <p className={`text-xs tracking-widest ${textFaint} mb-4 font-medium uppercase`}>
        {number}
      </p>
      <p className={`text-xs tracking-widest ${textMuted} mb-6 font-medium uppercase`}>
        {label}
      </p>
      <p className={`text-3xl md:text-4xl font-black ${text} tracking-tight mb-1`}>
        {price}
      </p>
      <p className={`text-xs ${textMuted} mb-6`}>
        {priceDetail}
      </p>
      <p className={`text-sm ${textSoft} leading-relaxed`}>
        {spots}
      </p>
      <p className={`text-xs font-bold ${dark ? 'text-white/70' : 'text-black/70'} tracking-wide uppercase mt-auto pt-6`}>
        {highlight}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Philosophy                                                         */
/* ------------------------------------------------------------------ */

function PricingPhilosophy() {
  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium uppercase">01</p>
          <p className="text-xs tracking-widest text-white/50 font-medium uppercase">The Model</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
            You share data. You pay less.
          </h2>

          <div className="space-y-4 text-sm text-white/50 leading-relaxed max-w-xl">
            <p>
              Adium is a data community. The benchmarks only exist because
              advertisers contribute their campaign performance.
            </p>
            <p>
              People who join early take a bigger bet: the dataset is smaller,
              the benchmarks are less refined. They deserve the best price.
            </p>
            <p>
              Your rate is locked the moment you sign up. It never goes up, even
              as the product gets better and the network grows.
            </p>
          </div>

          <div className="mt-10 border-l-2 border-peach pl-6">
            <p className="text-lg md:text-xl font-bold text-white/70 leading-snug">
              Think of it like equity.
              <br />
              <span className="text-peach">The earlier you invest, the better your price.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  What's included                                                    */
/* ------------------------------------------------------------------ */

function PricingIncludes() {
  const items = [
    'Full benchmark dashboard: CPC, CPA, CTR, ROAS, and more',
    'Segmented comparisons by industry, spend tier, and platform',
    'Nightly benchmark updates as the dataset refreshes',
    'Google Ads and Meta Ads support',
    'Read-only access. We never touch your campaigns',
  ]

  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium uppercase">02</p>
          <p className="text-xs tracking-widest text-white/50 font-medium uppercase">Every Plan</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
            All plans include everything.
          </h2>

          <ul className="space-y-4 max-w-xl">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-peach text-xs font-bold tracking-widest mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-white/60 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-white/40 leading-relaxed">
            No feature gating. No upsells. The only difference is when you signed up.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Day Pass                                                           */
/* ------------------------------------------------------------------ */

function PricingDayPass() {
  return (
    <section className="border-b border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 px-8 md:px-12 py-12">
          <p className="text-xs tracking-widest text-white/30 mb-2 font-medium uppercase">03</p>
          <p className="text-xs tracking-widest text-white/50 font-medium uppercase">Coming Soon</p>
        </div>

        <div className="lg:col-span-2 px-8 md:px-12 py-12">
          <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
            Day pass for non-contributors.
          </h2>

          <p className="text-sm text-white/50 leading-relaxed max-w-xl mb-8">
            Eventually, Adium will offer single-day access for advertisers who
            want benchmarks without connecting their own accounts.
          </p>

          <div className="bg-white/5 border border-white/10 px-6 py-5 max-w-xl">
            <p className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
              $500
            </p>
            <p className="text-xs text-white/40 mb-4">/ day · no account required</p>
            <p className="text-sm text-white/60 leading-relaxed">
              Access the full benchmark dataset for 24 hours without sharing
              your data. For teams that need a quick look without joining the
              network.
            </p>
          </div>

          <p className="mt-8 text-sm text-white/40 leading-relaxed max-w-xl">
            The network runs on shared data. If you don&apos;t contribute, you
            pay a premium. This keeps the exchange fair for everyone who does.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  CTA                                                                */
/* ------------------------------------------------------------------ */

function PricingCTA() {
  return (
    <section className="border-b border-white/10">
      <div className="bg-black px-8 md:px-16 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-widest text-white/30 mb-6 font-medium uppercase">
            Get Started
          </p>

          <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6">
            The earlier you join,
            <br />
            the less you pay.
          </h2>

          <p className="text-sm text-white/40 mb-4 max-w-md mx-auto leading-relaxed">
            Lock in your rate now. It never increases.
          </p>
          <p className="text-sm text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
            Connect your accounts and get benchmarks in under 60 seconds.
          </p>

          <Link
            href="/signup"
            className="inline-block bg-peach text-black text-sm font-bold tracking-widest px-8 py-4 hover:bg-peach-dark transition-colors uppercase"
          >
            Get Your Benchmarks
          </Link>
          <p className="mt-4 text-xs text-white/30 tracking-wide">
            Read-only access. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
