import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db/client';
import { GoogleAdsService } from '../services/googleAds.service';
import { FacebookAdsService } from '../services/facebookAds.service';
import { Platform } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

export const getAdAccounts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const adAccounts = await prisma.adAccount.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: adAccounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account not found');
    }

    res.json({
      success: true,
      data: adAccount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account not found');
    }

    await prisma.adAccount.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Ad account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const syncAdAccountMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      throw new ValidationError('startDate and endDate are required');
    }

    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account not found');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (adAccount.platform === Platform.GOOGLE_ADS) {
      await GoogleAdsService.syncMetrics(id, start, end);
    } else if (adAccount.platform === Platform.FACEBOOK_ADS) {
      await FacebookAdsService.syncMetrics(id, start, end);
    }

    res.json({
      success: true,
      message: 'Metrics sync initiated successfully',
    });
  } catch (error) {
    next(error);
  }
};
