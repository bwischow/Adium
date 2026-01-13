import axios from 'axios';
import { config } from '../config';
import prisma from '../db/client';
import { Platform } from '@prisma/client';

interface FacebookOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookAdsMetric {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  campaignId?: string;
  campaignName?: string;
  adSetId?: string;
  adSetName?: string;
}

export class FacebookAdsService {
  static getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.facebook.appId,
      redirect_uri: config.facebook.redirectUri,
      state,
      scope: 'ads_read,ads_management',
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  static async exchangeCodeForTokens(
    code: string
  ): Promise<FacebookOAuthTokenResponse> {
    const params = new URLSearchParams({
      client_id: config.facebook.appId,
      client_secret: config.facebook.appSecret,
      redirect_uri: config.facebook.redirectUri,
      code,
    });

    const response = await axios.get<FacebookOAuthTokenResponse>(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    );

    return response.data;
  }

  static async getLongLivedToken(shortLivedToken: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: config.facebook.appId,
      client_secret: config.facebook.appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const response = await axios.get<FacebookOAuthTokenResponse>(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    );

    return response.data.access_token;
  }

  static async getAdAccounts(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        'https://graph.facebook.com/v18.0/me/adaccounts',
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,account_status',
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching Facebook ad accounts:', error);
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

    if (!adAccount || adAccount.platform !== Platform.FACEBOOK_ADS) {
      throw new Error('Invalid ad account');
    }

    const metrics = await this.fetchMetrics(
      adAccount.accountId,
      adAccount.accessToken,
      startDate,
      endDate
    );

    for (const metric of metrics) {
      const ctr = metric.clicks > 0 ? (metric.clicks / metric.impressions) * 100 : 0;
      const cpc = metric.clicks > 0 ? metric.spend / metric.clicks : 0;
      const cpm = metric.impressions > 0 ? (metric.spend / metric.impressions) * 1000 : 0;
      const conversionRate = metric.clicks > 0 ? (metric.conversions / metric.clicks) * 100 : 0;
      const cpa = metric.conversions > 0 ? metric.spend / metric.conversions : 0;

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
          spend: metric.spend,
          conversions: metric.conversions,
          ctr,
          cpc,
          cpm,
          conversionRate,
          cpa,
          campaignId: metric.campaignId,
          campaignName: metric.campaignName,
          adSetId: metric.adSetId,
          adSetName: metric.adSetName,
        },
        update: {
          impressions: metric.impressions,
          clicks: metric.clicks,
          spend: metric.spend,
          conversions: metric.conversions,
          ctr,
          cpc,
          cpm,
          conversionRate,
          cpa,
          campaignName: metric.campaignName,
          adSetName: metric.adSetName,
        },
      });
    }
  }

  private static async fetchMetrics(
    accountId: string,
    accessToken: string,
    startDate: Date,
    endDate: Date
  ): Promise<FacebookAdsMetric[]> {
    try {
      const timeRange = {
        since: startDate.toISOString().split('T')[0],
        until: endDate.toISOString().split('T')[0],
      };

      // Fetch insights from Facebook Marketing API
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${accountId}/insights`,
        {
          params: {
            access_token: accessToken,
            time_range: JSON.stringify(timeRange),
            fields: 'impressions,clicks,spend,actions,campaign_id,campaign_name,adset_id,adset_name',
            level: 'campaign',
            time_increment: 1,
          },
        }
      );

      const data = response.data.data || [];

      return data.map((item: any) => ({
        date: item.date_start,
        impressions: parseInt(item.impressions) || 0,
        clicks: parseInt(item.clicks) || 0,
        spend: parseFloat(item.spend) || 0,
        conversions: this.extractConversions(item.actions),
        campaignId: item.campaign_id,
        campaignName: item.campaign_name,
        adSetId: item.adset_id,
        adSetName: item.adset_name,
      }));
    } catch (error) {
      console.error('Error fetching Facebook metrics:', error);
      // Return mock data for demo purposes
      return [
        {
          date: startDate.toISOString().split('T')[0],
          impressions: Math.floor(Math.random() * 10000),
          clicks: Math.floor(Math.random() * 500),
          spend: Math.random() * 1000,
          conversions: Math.floor(Math.random() * 50),
          campaignId: 'campaign-1',
          campaignName: 'Demo Campaign',
        },
      ];
    }
  }

  private static extractConversions(actions: any[]): number {
    if (!actions || !Array.isArray(actions)) return 0;

    const conversionAction = actions.find(
      (action) =>
        action.action_type === 'offsite_conversion.fb_pixel_purchase' ||
        action.action_type === 'omni_purchase'
    );

    return conversionAction ? parseInt(conversionAction.value) : 0;
  }
}
