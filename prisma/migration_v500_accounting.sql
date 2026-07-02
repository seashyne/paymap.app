-- PayMap v5.0.0 — Accounting Engine Migration
-- Creates: chart_of_accounts, journal_entries, ledger_lines
-- Also includes v4.2.1 R2 branding fields for stores

-- ── v4.2.1 R2 Branding (idempotent) ──────────────────────────────────────────
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url        TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS banner_url      TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS theme_color     TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS background_url  TEXT;

CREATE INDEX IF NOT EXISTS stores_user_id_created_at_idx ON stores(user_id, created_at);

-- ── v5 Accounting Engine ──────────────────────────────────────────────────────

CREATE TYPE IF NOT EXISTS account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id          TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code        TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  name_th     TEXT,
  type        account_type NOT NULL,
  is_system   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, code)
);

CREATE INDEX IF NOT EXISTS coa_user_id_idx  ON chart_of_accounts(user_id);
CREATE INDEX IF NOT EXISTS coa_user_type_idx ON chart_of_accounts(user_id, type);

CREATE TABLE IF NOT EXISTS journal_entries (
  id           TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id      TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id       TEXT,
  description  TEXT,
  date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_type  TEXT,
  source_id    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS je_user_id_date_idx          ON journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS je_user_source_idx           ON journal_entries(user_id, source_type, source_id);

CREATE TABLE IF NOT EXISTS ledger_lines (
  id          TEXT    NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  journal_id  TEXT    NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id  TEXT    NOT NULL REFERENCES chart_of_accounts(id),
  debit       DOUBLE PRECISION NOT NULL DEFAULT 0,
  credit      DOUBLE PRECISION NOT NULL DEFAULT 0,
  note        TEXT
);

CREATE INDEX IF NOT EXISTS ll_journal_id_idx  ON ledger_lines(journal_id);
CREATE INDEX IF NOT EXISTS ll_account_id_idx  ON ledger_lines(account_id);

-- ── v5 Performance Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS transactions_user_happened_at_idx ON transactions(user_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS journal_entries_date_idx          ON journal_entries(date DESC);
