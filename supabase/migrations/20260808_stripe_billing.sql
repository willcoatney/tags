-- Stripe billing columns on organizations
-- Run in Supabase SQL editor

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Index for webhook lookups (by stripe IDs)
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_customer_id ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_subscription_id ON organizations(stripe_subscription_id);

-- Ensure admins can see all, PMs only see their own org (RLS already covers this via organization_id)
-- No new RLS policies needed — existing org-scoped policies apply
