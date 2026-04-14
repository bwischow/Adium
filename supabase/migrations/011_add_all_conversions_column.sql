-- Add all_conversions column to daily_metrics for Google Ads API review compliance
ALTER TABLE daily_metrics ADD COLUMN all_conversions numeric(10,2) NOT NULL DEFAULT 0;
