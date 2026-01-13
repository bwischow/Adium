import axios from 'axios';
import { config } from '../config';
import prisma from '../db/client';
import { Platform } from '@prisma/client';

interface GoogleOAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleAdsMetric {
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  campaignId?: string;
  campaignName?: string;
}

export class GoogleAdsService {
  static getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.google.clientId,
      redirect_uri: config.google.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/adwords',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  static async exchangeCodeForTokens(
    code: string
  ): Promise<GoogleOAuthTokenResponse> {
    const response = await axios.post<GoogleOAuthTokenResponse>(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.redirectUri,
        grant_type: 'authorization_code',
      }
    );

    return response.data;
  }

  static async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await axios.post<GoogleOAuthTokenResponse>(
      'https://oauth2.googleapis.com/token',
      {
        refresh_token: refreshToken,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        grant_type: 'refresh_token',
      }
    );

    return response.data.access_token;
  }

  static async getCustomerAccounts(accessToken: string): Promise<any[]> {
    // This is a simplified version. In production, you'd use the google-ads-api library
    // to properly fetch customer accounts
    try {
      // Mock implementation - replace with actual Google Ads API call
      return [
        {
          id: 'demo-account-id',
          name: 'Demo Account',
        },
      ];
    } catch (error) {
      console.error('Error fetching Google Ads accounts:', error);
      throw error;
    }
  }

  static async syncMetrics(
    adAccountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: adAccountId },
    });

    if (!adAccount || adAccount.platform !== Platform.GOOGLE_ADS) {
      throw new Error('Invalid ad account');
    }

    // Refresh token if needed
    let accessToken = adAccount.accessToken;
    if (adAccount.tokenExpiresAt && adAccount.tokenExpiresAt < new Date()) {
      if (adAccount.refreshToken) {
        accessToken = await this.refreshAccessToken(adAccount.refreshToken);
        await prisma.adAccount.update({
          where: { id: adAccountId },
          data: {
            accessToken,
            tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
          },
        });
      }
    }

    // Fetch metrics from Google Ads API
    const metrics = await this.fetchMetrics(
      adAccount.accountId,
      accessToken,
      startDate,
      endDate
    );

    // Store metrics in database
    for (const metric of metrics) {
      const ctr = metric.clicks > 0 ? (metric.clicks / metric.impressions) * 100 : 0;
      const cpc = metric.clicks > 0 ? metric.cost / metric.clicks : 0;
      const cpm = metric.impressions > 0 ? (metric.cost / metric.impressions) * 1000 : 0;
      const conversionRate = metric.clicks > 0 ? (metric.conversions / metric.clicks) * 100 : 0;
      const cpa = metric.conversions > 0 ? metric.cost / metric.conversions : 0;

      await prisma.adMetric.upsert({
        where: {
          adAccountId_date_campaignId: {
            adAccountId,
            date: new Date(metric.date),
            campaignId: metric.campaignId || '',
          },
        },
        create: {
          adAccountId,
          date: new Date(metric.date),
          impressions: metric.impressions,
          clicks: metric.clicks,
          spend: metric.cost / 1000000, // Google Ads returns cost in micros
          conversions: metric.conversions,
          ctr,
          cpc,
          cpm,
          conversionRate,
          cpa,
          campaignId: metric.campaignId,
          campaignName: metric.campaignName,
        },
        update: {
          impressions: metric.impressions,
          clicks: metric.clicks,
          spend: metric.cost / 1000000,
          conversions: metric.conversions,
          ctr,
          cpc,
          cpm,
          conversionRate,
          cpa,
          campaignName: metric.campaignName,
        },
      });
    }
  }

  private static async fetchMetrics(
    customerId: string,
    accessToken: string,
    startDate: Date,
    endDate: Date
  ): Promise<GoogleAdsMetric[]> {
    // This is a simplified mock implementation
    // In production, use the google-ads-api library to fetch actual data
    // Example query would be:
    // SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks,
    //        metrics.cost_micros, metrics.conversions, segments.date
    // FROM campaign
    // WHERE segments.date BETWEEN 'start_date' AND 'end_date'

    const mockMetrics: GoogleAdsMetric[] = [
      {
        date: startDate.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 500),
        cost: Math.floor(Math.random() * 1000000000), // in micros
        conversions: Math.floor(Math.random() * 50),
        campaignId: 'campaign-1',
        campaignName: 'Demo Campaign',
      },
    ];

    return mockMetrics;
  }
}
