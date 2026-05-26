-- SpendLens schema
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  public_slug TEXT UNIQUE NOT NULL,
  tools JSONB NOT NULL,
  team_size INTEGER,
  primary_use_case TEXT,
  audit_result JSONB NOT NULL,
  ai_summary TEXT,
  total_monthly_savings DECIMAL(10,2),
  total_annual_savings DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  high_savings BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash TEXT PRIMARY KEY,
  audit_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audits_slug ON audits(public_slug);
CREATE INDEX IF NOT EXISTS idx_audits_created ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_audit_email_unique ON leads (audit_id, lower(email));

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public audits are readable" ON audits;
CREATE POLICY "Public audits are readable" ON audits
  FOR SELECT TO anon, authenticated USING (is_public = TRUE);

DROP POLICY IF EXISTS "Service role only insert" ON audits;
CREATE POLICY "Service role only insert" ON audits
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role only update" ON audits;
CREATE POLICY "Service role only update" ON audits
  FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role only read leads" ON leads;
CREATE POLICY "Service role only read leads" ON leads
  FOR SELECT USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role only insert leads" ON leads;
CREATE POLICY "Service role only insert leads" ON leads
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role only rate limit access" ON rate_limits;
CREATE POLICY "Service role only rate limit access" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON TABLE audits TO anon, authenticated;
GRANT ALL ON TABLE audits, leads, rate_limits TO service_role;
