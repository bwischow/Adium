-- Add leads column to daily_metrics for lead form ad campaigns
ALTER TABLE daily_metrics ADD COLUMN leads numeric(10,2) NOT NULL DEFAULT 0;
