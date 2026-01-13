import prisma from '../db/client';
import { Platform } from '@prisma/client';

export class AggregationService {
  static async calculateBenchmarks(date: Date, platform?: Platform): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Build query conditions
    const whereCondition: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (platform) {
      whereCondition.adAccount = {
        platform,
      };
    }

    // Fetch all metrics for the date
    const metrics = await prisma.adMetric.findMany({
      where: whereCondition,
      include: {
        adAccount: true,
      },
    });

    if (metrics.length === 0) {
      console.log(`No metrics found for date ${date} and platform ${platform}`);
      return;
    }

    // Get unique user count
    const uniqueUserIds = new Set(metrics.map((m) => m.adAccount.userId));
    const totalUsers = uniqueUserIds.size;

    // Calculate averages
    const totals = metrics.reduce(
      (acc, metric) => ({
        impressions: acc.impressions + metric.impressions,
        clicks: acc.clicks + metric.clicks,
        spend: acc.spend + metric.spend,
        conversions: acc.conversions + metric.conversions,
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    const avgImpressions = totals.impressions / metrics.length;
    const avgClicks = totals.clicks / metrics.length;
    const avgSpend = totals.spend / metrics.length;
    const avgConversions = totals.conversions / metrics.length;

    // Calculate CTR, CPC, CPM, Conversion Rate, CPA
    const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const avgCpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
    const avgConversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    const avgCpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;

    // Calculate percentiles for key metrics
    const ctrValues = metrics.map((m) => m.ctr || 0).sort((a, b) => a - b);
    const cpcValues = metrics.map((m) => m.cpc || 0).sort((a, b) => a - b);
    const conversionRateValues = metrics
      .map((m) => m.conversionRate || 0)
      .sort((a, b) => a - b);

    const getPercentile = (arr: number[], percentile: number): number => {
      const index = Math.ceil((percentile / 100) * arr.length) - 1;
      return arr[index] || 0;
    };

    // Create or update benchmark snapshot
    await prisma.benchmarkSnapshot.upsert({
      where: {
        date_platform: {
          date: startOfDay,
          platform: platform || null,
        },
      },
      create: {
        date: startOfDay,
        platform,
        totalUsers,
        avgImpressions,
        avgClicks,
        avgSpend,
        avgConversions,
        avgCtr,
        avgCpc,
        avgCpm,
        avgConversionRate,
        avgCpa,
        p25Ctr: getPercentile(ctrValues, 25),
        p50Ctr: getPercentile(ctrValues, 50),
        p75Ctr: getPercentile(ctrValues, 75),
        p90Ctr: getPercentile(ctrValues, 90),
        p25Cpc: getPercentile(cpcValues, 25),
        p50Cpc: getPercentile(cpcValues, 50),
        p75Cpc: getPercentile(cpcValues, 75),
        p90Cpc: getPercentile(cpcValues, 90),
        p25ConversionRate: getPercentile(conversionRateValues, 25),
        p50ConversionRate: getPercentile(conversionRateValues, 50),
        p75ConversionRate: getPercentile(conversionRateValues, 75),
        p90ConversionRate: getPercentile(conversionRateValues, 90),
      },
      update: {
        totalUsers,
        avgImpressions,
        avgClicks,
        avgSpend,
        avgConversions,
        avgCtr,
        avgCpc,
        avgCpm,
        avgConversionRate,
        avgCpa,
        p25Ctr: getPercentile(ctrValues, 25),
        p50Ctr: getPercentile(ctrValues, 50),
        p75Ctr: getPercentile(ctrValues, 75),
        p90Ctr: getPercentile(ctrValues, 90),
        p25Cpc: getPercentile(cpcValues, 25),
        p50Cpc: getPercentile(cpcValues, 50),
        p75Cpc: getPercentile(cpcValues, 75),
        p90Cpc: getPercentile(cpcValues, 90),
        p25ConversionRate: getPercentile(conversionRateValues, 25),
        p50ConversionRate: getPercentile(conversionRateValues, 50),
        p75ConversionRate: getPercentile(conversionRateValues, 75),
        p90ConversionRate: getPercentile(conversionRateValues, 90),
      },
    });

    console.log(
      `Benchmarks calculated for date ${date} and platform ${platform || 'ALL'}`
    );
  }

  static async recalculateBenchmarksForDateRange(
    startDate: Date,
    endDate: Date,
    platform?: Platform
  ): Promise<void> {
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      await this.calculateBenchmarks(new Date(currentDate), platform);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
}
