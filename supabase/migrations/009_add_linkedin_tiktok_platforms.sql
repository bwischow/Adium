-- Add LinkedIn Ads and TikTok Ads to the platform_type enum.
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction.
-- Run these statements individually in Supabase SQL Editor if needed.

ALTER TYPE platform_type ADD VALUE 'linkedin_ads';
ALTER TYPE platform_type ADD VALUE 'tiktok_ads';
