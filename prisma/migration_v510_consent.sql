-- PayMap v5.1 — Migration
-- Adds: User consent fields (TOS/Privacy acceptance tracking)

ALTER TABLE users ADD COLUMN IF NOT EXISTS tos_accepted_at    TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tos_version        TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_version     TEXT;

-- Index for quick consent check on login
CREATE INDEX IF NOT EXISTS users_tos_version_idx ON users(tos_version);
