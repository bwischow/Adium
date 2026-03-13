-- Add login_customer_id to ad_accounts.
-- For Google Ads accounts managed under an MCC, this stores the MCC's
-- customer ID which is required in the `login-customer-id` header for
-- all Google Ads API calls. NULL for Meta accounts and standalone
-- Google Ads accounts (where the account's own ID is used).

alter table ad_accounts
  add column if not exists login_customer_id text;
