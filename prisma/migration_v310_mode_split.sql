-- v3.1 Migration: Allow 1 email to register in multiple modes
-- Each (email, accountMode) pair is a separate account with separate data

-- Step 1: Drop old email unique constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP INDEX IF EXISTS users_email_key;

-- Step 2: Add composite unique constraint (email + accountMode)
-- This allows bob@gmail.com to have a personal account AND a business account
ALTER TABLE users ADD CONSTRAINT users_email_account_mode_key UNIQUE (email, "accountMode");

-- Step 3: Keep email index for fast lookups (login page showing available modes)
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Note: stripeCustomerId unique constraint stays as-is (each subscription is per account row)

-- v3.1 Profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "username"    TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "bio"         TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "phone"       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "website"     TEXT;

-- v3.1 Pay Profile
CREATE TABLE IF NOT EXISTS pay_profiles (
  id               TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "workspaceType"  TEXT        NOT NULL CHECK ("workspaceType" IN ('personal','business','merchant')),
  "organizationId" TEXT,
  "storeId"        TEXT,
  slug             TEXT        NOT NULL UNIQUE,
  "isActive"       BOOLEAN     NOT NULL DEFAULT true,
  "displayName"    TEXT        NOT NULL,
  bio              TEXT,
  "avatarUrl"      TEXT,
  "coverColor"     TEXT        DEFAULT '#7c3aed',
  "promptpayId"    TEXT,
  "promptpayType"  TEXT        CHECK ("promptpayType" IN ('PHONE','NID','TAX')),
  "bankAccount"    TEXT,
  "bankName"       TEXT,
  "presetAmounts"  INTEGER[]   DEFAULT '{}',
  currency         TEXT        NOT NULL DEFAULT 'THB',
  "allowCustom"    BOOLEAN     NOT NULL DEFAULT true,
  "requestNote"    BOOLEAN     NOT NULL DEFAULT false,
  "totalReceived"  INTEGER     NOT NULL DEFAULT 0,
  "lastViewedAt"   TIMESTAMPTZ,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "workspaceType")
);
CREATE INDEX IF NOT EXISTS pay_profiles_slug_idx ON pay_profiles (slug);
CREATE INDEX IF NOT EXISTS pay_profiles_user_idx ON pay_profiles ("userId");

-- v3.2 Pay Profile Premium customization fields
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "coverStyle"    TEXT DEFAULT 'color';
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "coverGradient" TEXT;
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "coverPattern"  TEXT;
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "frameStyle"    TEXT DEFAULT 'rounded';
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "frameColor"    TEXT;
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "frameGradient" TEXT;
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "fontStyle"     TEXT DEFAULT 'default';
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "layoutStyle"   TEXT DEFAULT 'center';
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "badgeText"     TEXT;
ALTER TABLE pay_profiles ADD COLUMN IF NOT EXISTS "badgeColor"    TEXT;
