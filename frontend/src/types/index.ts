export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export enum Platform {
  GOOGLE_ADS = 'GOOGLE_ADS',
  FACEBOOK_ADS = 'FACEBOOK_ADS',
}

export interface AdAccount {
  id: string;
  platform: Platform;
  accountId: string;
  accountName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdMetric {
  id: string;
  adAccountId: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  conversionRate?: number;
  cpa?: number;
  campaignId?: string;
  campaignName?: string;
  adSetId?: string;
  adSetName?: string;
}

export interface MetricsSummary {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgCpm: number;
  avgConversionRate: number;
  avgCpa: number;
}

export interface BenchmarkSnapshot {
  id: string;
  date: string;
  platform?: Platform;
  totalUsers: number;
  avgImpressions: number;
  avgClicks: number;
  avgSpend: number;
  avgConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgCpm: number;
  avgConversionRate: number;
  avgCpa: number;
  p25Ctr?: number;
  p50Ctr?: number;
  p75Ctr?: number;
  p90Ctr?: number;
}

export interface BenchmarkComparison {
  userStats: {
    ctr: number;
    cpc: number;
    cpm: number;
    conversionRate: number;
    cpa: number;
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    totalConversions: number;
  };
  benchmarks: {
    avgCtr: number;
    avgCpc: number;
    avgCpm: number;
    avgConversionRate: number;
    avgCpa: number;
    medianCtr: number;
    medianCpc: number;
    medianConversionRate: number;
  };
  comparison: {
    ctrDiff: number;
    cpcDiff: number;
    cpmDiff: number;
    conversionRateDiff: number;
    cpaDiff: number;
  };
}
