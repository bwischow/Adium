import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db/client';
import { Platform } from '@prisma/client';
import { ValidationError } from '../utils/errors';
import { AggregationService } from '../services/aggregation.service';

export const getBenchmarks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, platform } = req.query;

    if (!startDate || !endDate) {
      throw new ValidationError('startDate and endDate are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const whereCondition: any = {
      date: {
        gte: start,
        lte: end,
      },
    };

    if (platform) {
      whereCondition.platform = platform as Platform;
    }

    const benchmarks = await prisma.benchmarkSnapshot.findMany({
      where: whereCondition,
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      data: benchmarks,
    });
  } catch (error) {
    next(error);
  }
};

export const compareToBenchmark = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, platform } = req.query;

    if (!startDate || !endDate) {
      throw new ValidationError('startDate and endDate are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Get user's metrics
    const whereCondition: any = {
      adAccount: {
        userId,
      },
      date: {
        gte: start,
        lte: end,
      },
    };

    if (platform) {
      whereCondition.adAccount.platform = platform as Platform;
    }

    const userMetrics = await prisma.adMetric.findMany({
      where: whereCondition,
      include: {
        adAccount: true,
      },
    });

    if (userMetrics.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No metrics found for the specified period',
          userStats: null,
          benchmarks: null,
          comparison: null,
        },
      });
    }

    // Calculate user's stats
    const userTotals = userMetrics.reduce(
      (acc, metric) => ({
        impressions: acc.impressions + metric.impressions,
        clicks: acc.clicks + metric.clicks,
        spend: acc.spend + metric.spend,
        conversions: acc.conversions + metric.conversions,
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    const userCtr =
      userTotals.impressions > 0
        ? (userTotals.clicks / userTotals.impressions) * 100
        : 0;
    const userCpc =
      userTotals.clicks > 0 ? userTotals.spend / userTotals.clicks : 0;
    const userCpm =
      userTotals.impressions > 0
        ? (userTotals.spend / userTotals.impressions) * 1000
        : 0;
    const userConversionRate =
      userTotals.clicks > 0
        ? (userTotals.conversions / userTotals.clicks) * 100
        : 0;
    const userCpa =
      userTotals.conversions > 0
        ? userTotals.spend / userTotals.conversions
        : 0;

    // Get benchmark data
    const benchmarkCondition: any = {
      date: {
        gte: start,
        lte: end,
      },
    };

    if (platform) {
      benchmarkCondition.platform = platform as Platform;
    }

    const benchmarks = await prisma.benchmarkSnapshot.findMany({
      where: benchmarkCondition,
    });

    if (benchmarks.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No benchmark data available for the specified period',
          userStats: {
            ctr: userCtr,
            cpc: userCpc,
            cpm: userCpm,
            conversionRate: userConversionRate,
            cpa: userCpa,
          },
          benchmarks: null,
          comparison: null,
        },
      });
    }

    // Average the benchmarks
    const avgBenchmark = benchmarks.reduce(
      (acc, b) => ({
        avgCtr: acc.avgCtr + b.avgCtr,
        avgCpc: acc.avgCpc + b.avgCpc,
        avgCpm: acc.avgCpm + b.avgCpm,
        avgConversionRate: acc.avgConversionRate + b.avgConversionRate,
        avgCpa: acc.avgCpa + b.avgCpa,
        p50Ctr: acc.p50Ctr + (b.p50Ctr || 0),
        p50Cpc: acc.p50Cpc + (b.p50Cpc || 0),
        p50ConversionRate:
          acc.p50ConversionRate + (b.p50ConversionRate || 0),
      }),
      {
        avgCtr: 0,
        avgCpc: 0,
        avgCpm: 0,
        avgConversionRate: 0,
        avgCpa: 0,
        p50Ctr: 0,
        p50Cpc: 0,
        p50ConversionRate: 0,
      }
    );

    const benchmarkCount = benchmarks.length;
    const benchmarkStats = {
      avgCtr: avgBenchmark.avgCtr / benchmarkCount,
      avgCpc: avgBenchmark.avgCpc / benchmarkCount,
      avgCpm: avgBenchmark.avgCpm / benchmarkCount,
      avgConversionRate: avgBenchmark.avgConversionRate / benchmarkCount,
      avgCpa: avgBenchmark.avgCpa / benchmarkCount,
      medianCtr: avgBenchmark.p50Ctr / benchmarkCount,
      medianCpc: avgBenchmark.p50Cpc / benchmarkCount,
      medianConversionRate: avgBenchmark.p50ConversionRate / benchmarkCount,
    };

    // Calculate comparison percentages
    const comparison = {
      ctrDiff: benchmarkStats.avgCtr > 0
        ? ((userCtr - benchmarkStats.avgCtr) / benchmarkStats.avgCtr) * 100
        : 0,
      cpcDiff: benchmarkStats.avgCpc > 0
        ? ((userCpc - benchmarkStats.avgCpc) / benchmarkStats.avgCpc) * 100
        : 0,
      cpmDiff: benchmarkStats.avgCpm > 0
        ? ((userCpm - benchmarkStats.avgCpm) / benchmarkStats.avgCpm) * 100
        : 0,
      conversionRateDiff:
        benchmarkStats.avgConversionRate > 0
          ? ((userConversionRate - benchmarkStats.avgConversionRate) /
              benchmarkStats.avgConversionRate) *
            100
          : 0,
      cpaDiff: benchmarkStats.avgCpa > 0
        ? ((userCpa - benchmarkStats.avgCpa) / benchmarkStats.avgCpa) * 100
        : 0,
    };

    res.json({
      success: true,
      data: {
        userStats: {
          ctr: userCtr,
          cpc: userCpc,
          cpm: userCpm,
          conversionRate: userConversionRate,
          cpa: userCpa,
          totalImpressions: userTotals.impressions,
          totalClicks: userTotals.clicks,
          totalSpend: userTotals.spend,
          totalConversions: userTotals.conversions,
        },
        benchmarks: benchmarkStats,
        comparison,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const triggerBenchmarkCalculation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, platform } = req.body;

    if (!startDate || !endDate) {
      throw new ValidationError('startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Trigger benchmark calculation in background
    AggregationService.recalculateBenchmarksForDateRange(
      start,
      end,
      platform as Platform | undefined
    ).catch((error) => {
      console.error('Error calculating benchmarks:', error);
    });

    res.json({
      success: true,
      message: 'Benchmark calculation initiated',
    });
  } catch (error) {
    next(error);
  }
};
