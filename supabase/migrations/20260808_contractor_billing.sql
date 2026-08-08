-- Contractor per-job charge tracking on bids
ALTER TABLE bids
  ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT,
  ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER;

-- Index for charge lookups
CREATE INDEX IF NOT EXISTS idx_bids_stripe_charge_id ON bids(stripe_charge_id);
