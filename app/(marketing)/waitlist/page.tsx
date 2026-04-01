import type { Metadata } from 'next'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'
import { LandingProductShowcase } from '@/components/landing/LandingProductShowcase'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingSolution } from '@/components/landing/LandingSolution'
import { LandingWhatYoullLearn } from '@/components/landing/LandingWhatYoullLearn'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingNetwork } from '@/components/landing/LandingNetwork'
import { LandingTrust } from '@/components/landing/LandingTrust'
import { LandingAudience } from '@/components/landing/LandingAudience'
import { LandingCTA } from '@/components/landing/LandingCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { WaitlistModal } from '@/components/landing/WaitlistModal'

export const metadata: Metadata = {
  title: 'Adium - Join the Waitlist',
  description:
    'Be the first to benchmark your Google Ads and Meta Ads campaigns against real advertisers. Join the Adium waitlist today.',
  openGraph: {
    title: 'Adium - Join the Waitlist',
    description:
      'Be the first to benchmark your ad performance against real advertisers like you.',
    type: 'website',
  },
}

export default function WaitlistPage() {
  return (
    <>
      <LandingNav waitlist />
      <LandingHero waitlist />
      <LandingSocialProof />
      <LandingProductShowcase />
      <LandingProblem />
      <LandingSolution />
      <LandingWhatYoullLearn />
      <LandingHowItWorks />
      <LandingNetwork />
      <LandingTrust />
      <LandingAudience />
      <LandingCTA waitlist />
      <LandingFooter />
      <WaitlistModal />
    </>
  )
}
