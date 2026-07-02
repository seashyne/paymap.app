-- PayMap v5.3.0 Full Platform Baseline
-- Apply after reviewing against your current production schema.

ALTER TYPE "SubStatus" ADD VALUE IF NOT EXISTS 'past_due';
ALTER TYPE "SubStatus" ADD VALUE IF NOT EXISTS 'expired';
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'partial';
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'refunded';

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'THB',
  ADD COLUMN IF NOT EXISTS plan_code TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'THB',
  ADD COLUMN IF NOT EXISTS note TEXT;

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items(invoice_id);

CREATE TABLE IF NOT EXISTS invoice_payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT NOT NULL,
  reference TEXT,
  note TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invoice_payments_invoice_id_idx ON invoice_payments(invoice_id);

CREATE TABLE IF NOT EXISTS bank_statements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  source_label TEXT,
  currency TEXT NOT NULL DEFAULT 'THB',
  account_name TEXT,
  account_number TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bank_statements_user_id_imported_at_idx ON bank_statements(user_id, imported_at DESC);

CREATE TABLE IF NOT EXISTS statement_lines (
  id TEXT PRIMARY KEY,
  statement_id TEXT NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  booked_at TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  amount NUMERIC(12,2) NOT NULL,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS statement_lines_statement_id_line_no_idx ON statement_lines(statement_id, line_no);

CREATE TABLE IF NOT EXISTS reconciliation_matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  statement_line_id TEXT NOT NULL REFERENCES statement_lines(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'matched',
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0.9,
  delta_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  delta_days INTEGER NOT NULL DEFAULT 0,
  approved_at TIMESTAMPTZ,
  approved_by_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(statement_line_id, transaction_id)
);
CREATE INDEX IF NOT EXISTS reconciliation_matches_user_id_status_idx ON reconciliation_matches(user_id, status);

CREATE TABLE IF NOT EXISTS consent_versions (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  version TEXT NOT NULL,
  label TEXT NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key, version)
);
CREATE TABLE IF NOT EXISTS user_consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_key TEXT NOT NULL,
  version_id TEXT NOT NULL REFERENCES consent_versions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted',
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, consent_key, version_id)
);
CREATE TABLE IF NOT EXISTS consent_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_key TEXT NOT NULL,
  action TEXT NOT NULL,
  version TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
