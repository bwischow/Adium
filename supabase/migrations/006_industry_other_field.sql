-- Add a free-text field for users who select "Other" industry
-- so we can track what industries are missing
ALTER TABLE companies ADD COLUMN industry_other text;
