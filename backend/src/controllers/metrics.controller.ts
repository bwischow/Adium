import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db/client';
import { NotFoundError, ValidationError } from '../utils/errors';

export const getUserMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, adAccountId } = req.query;

    if (!startDate || !endDate) {
      throw new ValidationError('startDate and endDate are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const whereCondition: any = {
      adAccount: {
        userId,
      },
      date: {
        gte: start,
        lte: end,
      },
    };

    if (adAccountId) {
      whereCondition.adAccountId = adAccountId;
    }

    const metrics = await prisma.adMetric.findMany({
      where: whereCondition,
      include: {
        adAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate aggregated stats
    const totals = metrics.reduce(
      (acc, metric) => ({
        impressions: acc.impressions + metric.impressions,
        clicks: acc.clicks + metric.clicks,
        spend: acc.spend + metric.spend,
        conversions: acc.conversions + metric.conversions,
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    const avgCtr =
      totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const avgCpm =
      totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
    const avgConversionRate =
      totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    const avgCpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;

    res.json({
      success: true,
      data: {
        metrics,
        summary: {
          totalImpressions: totals.impressions,
          totalClicks: totals.clicks,
          totalSpend: totals.spend,
          totalConversions: totals.conversions,
          avgCtr,
          avgCpc,
          avgCpm,
          avgConversionRate,
          avgCpa,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMetricsByAdAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { adAccountId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ValidationError('startDate and endDate are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        userId,
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account not found');
    }

    const metrics = await prisma.adMetric.findMany({
      where: {
        adAccountId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};
