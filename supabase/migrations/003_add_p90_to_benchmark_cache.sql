-- Add P90 percentile value to benchmark_cache for the P50/P75/P90 model
ALTER TABLE benchmark_cache ADD COLUMN IF NOT EXISTS p90_value numeric(12,4);
