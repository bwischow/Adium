export type Platform = 'google_ads' | 'meta'

export type SpendQuartile = 1 | 2 | 3 | 4

export type MetricName = 'cpc' | 'cpm' | 'ctr' | 'roas' | 'cpa'

export interface Industry {
  id: number
  name: string
  slug: string
}

export interface Company {
  id: string
  user_id: string
  name: string
  industry_id: number
  website?: string | null
  phone?: string | null
  email?: string | null
  created_at: string
  industry?: Industry
}

export interface AdAccount {
  id: string
  company_id: string
  platform: Platform
  platform_account_id: string
  account_name: string
  is_active: boolean
  connected_at: string
}

export interface DailyMetric {
  id: string
  ad_account_id: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  conversion_value: number
  pulled_at: string
}

export interface AccountSpendTier {
  ad_account_id: string
  industry_id: number
  platform: Platform
  quartile: SpendQuartile
  trailing_30d_spend: number
  calculated_at: string
}

export interface BenchmarkCache {
  industry_id: number
  platform: Platform
  spend_quartile: SpendQuartile | null
  date: string
  metric_name: MetricName
  avg_value: number
  median_value: number
  p25_value: number
  p75_value: number
  account_count: number
}

// Dashboard data shapes
export interface DailyPoint {
  date: string
  value: number | null
}

export interface BenchmarkSeries {
  date: string
  median: number | null
  p25: number | null
  p75: number | null
}

export interface DashboardData {
  userSeries: DailyPoint[]
  benchmarkSeries: BenchmarkSeries[]
  accountCount: number
  hasEnoughPeers: boolean
  spendTierLabel: string | null
}

export const SPEND_TIER_LABELS: Record<SpendQuartile, string> = {
  1: 'Lower spend tier',
  2: 'Mid-low spend tier',
  3: 'Mid-high spend tier',
  4: 'Top spend tier',
}

export const METRIC_LABELS: Record<MetricName, string> = {
  cpc: 'CPC',
  cpm: 'CPM',
  ctr: 'CTR',
  roas: 'ROAS',
  cpa: 'CPA',
}

export const METRIC_FORMATS: Record<MetricName, (v: number) => string> = {
  cpc: (v) => `$${v.toFixed(2)}`,
  cpm: (v) => `$${v.toFixed(2)}`,
  ctr: (v) => `${(v * 100).toFixed(2)}%`,
  roas: (v) => `${v.toFixed(2)}x`,
  cpa: (v) => `$${v.toFixed(2)}`,
}

export const INDUSTRIES: Industry[] = [
  { id: 1, name: 'E-commerce / DTC', slug: 'ecommerce-dtc' },
  { id: 2, name: 'SaaS / Software', slug: 'saas-software' },
  { id: 3, name: 'Local Services', slug: 'local-services' },
  { id: 4, name: 'Healthcare / Wellness', slug: 'healthcare-wellness' },
  { id: 5, name: 'Financial Services', slug: 'financial-services' },
  { id: 6, name: 'Education / EdTech', slug: 'education-edtech' },
  { id: 7, name: 'Real Estate', slug: 'real-estate' },
  { id: 8, name: 'Other', slug: 'other' },
]
