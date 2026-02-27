import type { MetricName } from '@/types'

interface RawRow {
  impressions: number
  clicks: number
  spend: number
  conversions: number
  conversion_value: number
}

/** Calculate a derived metric from a raw daily_metrics row. Returns null if
 *  the denominator is zero to avoid division-by-zero artifacts. */
export function deriveMetric(row: RawRow, metric: MetricName): number | null {
  const { impressions, clicks, spend, conversions, conversion_value } = row

  switch (metric) {
    case 'cpc':
      return clicks > 0 ? spend / clicks : null
    case 'cpm':
      return impressions > 0 ? (spend / impressions) * 1000 : null
    case 'ctr':
      return impressions > 0 ? clicks / impressions : null
    case 'roas':
      return spend > 0 ? conversion_value / spend : null
    case 'cpa':
      return conversions > 0 ? spend / conversions : null
  }
}
