import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db/client';
import { GoogleAdsService } from '../services/googleAds.service';
import { FacebookAdsService } from '../services/facebookAds.service';
import { Platform } from '@prisma/client';
import { config } from '../config';
import { ValidationError } from '../utils/errors';

export const initiateGoogleOAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const authUrl = GoogleAdsService.getAuthUrl(state);

    res.json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleOAuthCallback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      throw new ValidationError('Missing code or state parameter');
    }

    const { userId } = JSON.parse(
      Buffer.from(state as string, 'base64').toString()
    );

    const tokens = await GoogleAdsService.exchangeCodeForTokens(code as string);

    // Fetch customer accounts
    const accounts = await GoogleAdsService.getCustomerAccounts(
      tokens.access_token
    );

    // Store ad accounts
    for (const account of accounts) {
      await prisma.adAccount.upsert({
        where: {
          platform_accountId: {
            platform: Platform.GOOGLE_ADS,
            accountId: account.id,
          },
        },
        create: {
          userId,
          platform: Platform.GOOGLE_ADS,
          accountId: account.id,
          accountName: account.name,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          isActive: true,
        },
      });
    }

    res.redirect(`${config.frontend.url}/dashboard?oauth=success`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${config.frontend.url}/dashboard?oauth=error`);
  }
};

export const initiateFacebookOAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const authUrl = FacebookAdsService.getAuthUrl(state);

    res.json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const handleFacebookOAuthCallback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      throw new ValidationError('Missing code or state parameter');
    }

    const { userId } = JSON.parse(
      Buffer.from(state as string, 'base64').toString()
    );

    const tokens = await FacebookAdsService.exchangeCodeForTokens(
      code as string
    );

    // Exchange for long-lived token
    const longLivedToken = await FacebookAdsService.getLongLivedToken(
      tokens.access_token
    );

    // Fetch ad accounts
    const accounts = await FacebookAdsService.getAdAccounts(longLivedToken);

    // Store ad accounts
    for (const account of accounts) {
      await prisma.adAccount.upsert({
        where: {
          platform_accountId: {
            platform: Platform.FACEBOOK_ADS,
            accountId: account.id,
          },
        },
        create: {
          userId,
          platform: Platform.FACEBOOK_ADS,
          accountId: account.id,
          accountName: account.name,
          accessToken: longLivedToken,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        },
        update: {
          accessToken: longLivedToken,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });
    }

    res.redirect(`${config.frontend.url}/dashboard?oauth=success`);
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    res.redirect(`${config.frontend.url}/dashboard?oauth=error`);
  }
};
