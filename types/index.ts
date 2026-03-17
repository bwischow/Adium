export type Platform = 'google_ads' | 'meta'

export type SpendQuartile = 1 | 2 | 3 | 4

export type MetricName = 'cpc' | 'cpm' | 'ctr' | 'roas' | 'cpa' | 'cpl'

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
  industry_other?: string | null
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
  leads: number
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
  p90_value: number
  account_count: number
}

// Dashboard data shapes
export interface DailyPoint {
  date: string
  value: number | null
}

export interface BenchmarkSeries {
  date: string
  p50: number | null
  p75: number | null
  p90: number | null
}

export interface DashboardData {
  userSeries: DailyPoint[]
  benchmarkSeries: BenchmarkSeries[]
  accountCount: number
  hasEnoughPeers: boolean
  spendTierLabel: string | null
  isHistoricalFallback?: boolean
}

export interface NotificationPreferences {
  emails_enabled: boolean
  drift_alerts: Record<MetricName, boolean>
  benchmark_alerts: Record<MetricName, boolean>
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
  cpl: 'CPL',
}

export const METRIC_FORMATS: Record<MetricName, (v: number) => string> = {
  cpc: (v) => `$${v.toFixed(2)}`,
  cpm: (v) => `$${v.toFixed(2)}`,
  ctr: (v) => `${(v * 100).toFixed(2)}%`,
  roas: (v) => `${v.toFixed(2)}x`,
  cpa: (v) => `$${v.toFixed(2)}`,
  cpl: (v) => `$${v.toFixed(2)}`,
}

export const INDUSTRIES: Industry[] = [
  { id: 1,  name: 'E-commerce / DTC',        slug: 'ecommerce-dtc' },
  { id: 2,  name: 'SaaS / Software',         slug: 'saas-software' },
  { id: 3,  name: 'Local Services',           slug: 'local-services' },
  { id: 4,  name: 'Healthcare / Wellness',    slug: 'healthcare-wellness' },
  { id: 5,  name: 'Financial Services',       slug: 'financial-services' },
  { id: 6,  name: 'Education / EdTech',       slug: 'education-edtech' },
  { id: 7,  name: 'Real Estate',              slug: 'real-estate' },
  { id: 9,  name: 'Marketplaces',             slug: 'marketplaces' },
  { id: 10, name: 'Travel / Hospitality',     slug: 'travel-hospitality' },
  { id: 11, name: 'Food / Beverage / CPG',    slug: 'food-beverage-cpg' },
  { id: 12, name: 'Automotive',               slug: 'automotive' },
  { id: 13, name: 'Fashion / Apparel',        slug: 'fashion-apparel' },
  { id: 14, name: 'Home / Garden',            slug: 'home-garden' },
  { id: 15, name: 'Beauty / Personal Care',   slug: 'beauty-personal-care' },
  { id: 16, name: 'B2B / Professional Services', slug: 'b2b-professional-services' },
  { id: 17, name: 'Media / Entertainment',    slug: 'media-entertainment' },
  { id: 18, name: 'Fitness / Sports',         slug: 'fitness-sports' },
  { id: 19, name: 'Nonprofit / Cause',        slug: 'nonprofit-cause' },
  { id: 20, name: 'Legal',                    slug: 'legal' },
  { id: 8,  name: 'Other',                    slug: 'other' },
]
