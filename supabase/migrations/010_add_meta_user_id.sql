-- Add meta_user_id to ad_accounts and pending_oauth_sessions for handling
-- Meta deauthorize/deletion callbacks. When Meta sends a deauthorize or
-- data deletion request, it identifies the user by their Meta user ID.
-- We need this to find and clean up the right accounts.

alter table ad_accounts
  add column meta_user_id text;

alter table pending_oauth_sessions
  add column meta_user_id text;

-- Add index for efficient lookup during webhook callbacks
create index ad_accounts_meta_user_id_idx on ad_accounts(meta_user_id)
  where meta_user_id is not null;
