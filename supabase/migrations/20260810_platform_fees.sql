-- Platform fee tracking columns on bids table
-- Adds status lifecycle, timestamps, and index for admin queries

ALTER TABLE bids
  ADD COLUMN IF NOT EXISTS platform_fee_status TEXT NOT NULL DEFAULT 'not_applicable'
    CHECK (platform_fee_status IN ('not_applicable', 'charged', 'pending', 'failed', 'waived')),
  ADD COLUMN IF NOT EXISTS platform_fee_failed_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS platform_fee_charged_at TIMESTAMPTZ;

-- Index for admin page queries filtering by fee status
CREATE INDEX IF NOT EXISTS idx_bids_platform_fee_status ON bids (platform_fee_status);
