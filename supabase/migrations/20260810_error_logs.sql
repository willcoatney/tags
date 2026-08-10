-- 2026-08-10: Create error_logs table for operational visibility
-- Used by the error-logger.ts utility to record all caught errors across the platform

CREATE TABLE IF NOT EXISTS error_logs (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz   NOT NULL DEFAULT now(),
  category         text          NOT NULL CHECK (category IN ('stripe', 'sms', 'email', 'db', 'auth', 'api')),
  severity         text          NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  message          text          NOT NULL,
  metadata         jsonb,
  route            text,
  user_id          uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id  uuid          REFERENCES organizations(id) ON DELETE SET NULL,
  resolved         boolean       NOT NULL DEFAULT false
);

-- Indexes for common query patterns used in the admin dashboard
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at      ON error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_category        ON error_logs (category);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity        ON error_logs (severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved        ON error_logs (resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved      ON error_logs (created_at DESC) WHERE resolved = false;

-- RLS: Enable row-level security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Service role (admin client) can INSERT — no authenticated users can insert directly
CREATE POLICY "Service role can insert error logs"
  ON error_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admin users can SELECT via service role client (server-side only)
-- The API route enforces admin role check in application code
CREATE POLICY "Service role can select error logs"
  ON error_logs FOR SELECT
  TO service_role
  USING (true);

-- Service role can UPDATE (for resolving logs)
CREATE POLICY "Service role can update error logs"
  ON error_logs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
