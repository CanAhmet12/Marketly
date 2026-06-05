-- DATA FEED MEGA SPRINT — idempotent migrations
-- Deploy: Supabase SQL Editor (production manual apply)

-- ── market_news: upsert conflict target (fetch-market-news Edge Function) ─────
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_news_url_unique ON market_news(url);

-- ── job_runs: data feed observability (optional — Edge Functions may log here) ─
CREATE TABLE IF NOT EXISTS job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  rows_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_job_runs_name_started ON job_runs(job_name, started_at DESC);

ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;

-- Public read for admin dashboards; writes via service role only (no client INSERT policy)
DROP POLICY IF EXISTS "Herkes job runs gorebilir" ON job_runs;
CREATE POLICY "Herkes job runs gorebilir"
  ON job_runs FOR SELECT USING (true);
