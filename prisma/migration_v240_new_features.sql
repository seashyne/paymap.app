-- ============================================================
-- PayMap v24.0 Migration: New Features
-- Features: Multi-Wallet, Installment, Loan, NetWorth,
--           Investment, Gamification
-- Run: psql $DATABASE_URL -f migration_v240_new_features.sql
-- ============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE "WalletType" AS ENUM ('cash','bank','credit_card','ewallet','crypto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InstallmentStatus" AS ENUM ('active','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LoanDirection" AS ENUM ('lent','borrowed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LoanStatus" AS ENUM ('active','settled','overdue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AssetType" AS ENUM ('cash','stock','crypto','property','vehicle','fund','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LiabilityType" AS ENUM ('credit_card','mortgage','car_loan','personal_loan','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InvestmentType" AS ENUM ('stock','fund','crypto','etf','bond','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InvestmentTxType" AS ENUM ('buy','sell','dividend');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 1. wallets ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "wallets" (
  "id"           TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"       TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "type"         "WalletType" NOT NULL,
  "balance"      DECIMAL(12,2) NOT NULL DEFAULT 0,
  "currency"     TEXT NOT NULL DEFAULT 'THB',
  "color"        TEXT DEFAULT '#8b5cf6',
  "icon"         TEXT DEFAULT '💳',
  "bankName"     TEXT,
  "accountLast4" TEXT,
  "isDefault"    BOOLEAN NOT NULL DEFAULT false,
  "isArchived"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "wallets_userId_idx" ON "wallets"("userId");

-- ── 2. wallet_transfers ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "wallet_transfers" (
  "id"           TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"       TEXT NOT NULL,
  "fromWalletId" TEXT NOT NULL,
  "toWalletId"   TEXT NOT NULL,
  "amount"       DECIMAL(12,2) NOT NULL,
  "fee"          DECIMAL(10,2) NOT NULL DEFAULT 0,
  "note"         TEXT,
  "happenedAt"   TIMESTAMPTZ NOT NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId")       REFERENCES "users"("id")   ON DELETE CASCADE,
  FOREIGN KEY ("fromWalletId") REFERENCES "wallets"("id") ON DELETE RESTRICT,
  FOREIGN KEY ("toWalletId")   REFERENCES "wallets"("id") ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS "wallet_transfers_userId_idx"       ON "wallet_transfers"("userId");
CREATE INDEX IF NOT EXISTS "wallet_transfers_fromWalletId_idx" ON "wallet_transfers"("fromWalletId");
CREATE INDEX IF NOT EXISTS "wallet_transfers_toWalletId_idx"   ON "wallet_transfers"("toWalletId");

-- ── 3. installments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "installments" (
  "id"            TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "totalAmount"   DECIMAL(12,2) NOT NULL,
  "downPayment"   DECIMAL(12,2) NOT NULL DEFAULT 0,
  "monthlyAmount" DECIMAL(12,2) NOT NULL,
  "totalMonths"   INT NOT NULL,
  "paidMonths"    INT NOT NULL DEFAULT 0,
  "interestRate"  DECIMAL(5,2) NOT NULL DEFAULT 0,
  "currency"      TEXT NOT NULL DEFAULT 'THB',
  "startDate"     TIMESTAMPTZ NOT NULL,
  "nextDueDate"   TIMESTAMPTZ NOT NULL,
  "icon"          TEXT DEFAULT '📱',
  "color"         TEXT DEFAULT '#f59e0b',
  "note"          TEXT,
  "status"        "InstallmentStatus" NOT NULL DEFAULT 'active',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "installments_userId_idx"        ON "installments"("userId");
CREATE INDEX IF NOT EXISTS "installments_userId_status_idx" ON "installments"("userId","status");

-- ── 4. installment_payments ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "installment_payments" (
  "id"            TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "installmentId" TEXT NOT NULL,
  "amount"        DECIMAL(12,2) NOT NULL,
  "paidAt"        TIMESTAMPTZ NOT NULL,
  "note"          TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("installmentId") REFERENCES "installments"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "installment_payments_installmentId_idx" ON "installment_payments"("installmentId");

-- ── 5. loans ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "loans" (
  "id"         TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT NOT NULL,
  "personName" TEXT NOT NULL,
  "direction"  "LoanDirection" NOT NULL,
  "amount"     DECIMAL(12,2) NOT NULL,
  "remaining"  DECIMAL(12,2) NOT NULL,
  "currency"   TEXT NOT NULL DEFAULT 'THB',
  "dueDate"    TIMESTAMPTZ,
  "note"       TEXT,
  "status"     "LoanStatus" NOT NULL DEFAULT 'active',
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "loans_userId_idx"        ON "loans"("userId");
CREATE INDEX IF NOT EXISTS "loans_userId_status_idx" ON "loans"("userId","status");

-- ── 6. loan_repayments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "loan_repayments" (
  "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "loanId"    TEXT NOT NULL,
  "amount"    DECIMAL(12,2) NOT NULL,
  "paidAt"    TIMESTAMPTZ NOT NULL,
  "note"      TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "loan_repayments_loanId_idx" ON "loan_repayments"("loanId");

-- ── 7. assets ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "assets" (
  "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "type"      "AssetType" NOT NULL,
  "value"     DECIMAL(14,2) NOT NULL,
  "currency"  TEXT NOT NULL DEFAULT 'THB',
  "icon"      TEXT DEFAULT '🏠',
  "color"     TEXT DEFAULT '#22c55e',
  "note"      TEXT,
  "asOfDate"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "assets_userId_idx" ON "assets"("userId");

-- ── 8. liabilities ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "liabilities" (
  "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "type"      "LiabilityType" NOT NULL,
  "amount"    DECIMAL(14,2) NOT NULL,
  "currency"  TEXT NOT NULL DEFAULT 'THB',
  "icon"      TEXT DEFAULT '💳',
  "color"     TEXT DEFAULT '#ef4444',
  "note"      TEXT,
  "asOfDate"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "liabilities_userId_idx" ON "liabilities"("userId");

-- ── 9. net_worth_snapshots ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "net_worth_snapshots" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT NOT NULL,
  "totalAssets" DECIMAL(14,2) NOT NULL,
  "totalDebt"   DECIMAL(14,2) NOT NULL,
  "netWorth"    DECIMAL(14,2) NOT NULL,
  "snapshotAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "net_worth_snapshots_userId_snapshotAt_idx" ON "net_worth_snapshots"("userId","snapshotAt");

-- ── 10. investments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "investments" (
  "id"           TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"       TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "ticker"       TEXT,
  "type"         "InvestmentType" NOT NULL,
  "units"        DECIMAL(14,6) NOT NULL DEFAULT 0,
  "avgCost"      DECIMAL(14,4) NOT NULL DEFAULT 0,
  "currentPrice" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "currency"     TEXT NOT NULL DEFAULT 'THB',
  "exchange"     TEXT,
  "icon"         TEXT DEFAULT '📈',
  "color"        TEXT DEFAULT '#14b8a6',
  "note"         TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "investments_userId_idx" ON "investments"("userId");

-- ── 11. investment_txs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "investment_txs" (
  "id"           TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "investmentId" TEXT NOT NULL,
  "txType"       "InvestmentTxType" NOT NULL,
  "units"        DECIMAL(14,6) NOT NULL,
  "price"        DECIMAL(14,4) NOT NULL,
  "fee"          DECIMAL(10,2) NOT NULL DEFAULT 0,
  "happenedAt"   TIMESTAMPTZ NOT NULL,
  "note"         TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "investment_txs_investmentId_idx" ON "investment_txs"("investmentId");

-- ── 12. user_stats (Gamification) ────────────────────────────────
CREATE TABLE IF NOT EXISTS "user_stats" (
  "id"             TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"         TEXT NOT NULL UNIQUE,
  "xp"             INT NOT NULL DEFAULT 0,
  "level"          INT NOT NULL DEFAULT 1,
  "savingStreak"   INT NOT NULL DEFAULT 0,
  "lastSavingDate" TIMESTAMPTZ,
  "budgetStreak"   INT NOT NULL DEFAULT 0,
  "lastBudgetDate" TIMESTAMPTZ,
  "totalBadges"    INT NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 13. achievements (Gamification) ──────────────────────────────
CREATE TABLE IF NOT EXISTS "achievements" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT NOT NULL,
  "code"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon"        TEXT NOT NULL DEFAULT '🏆',
  "xpReward"    INT NOT NULL DEFAULT 10,
  "earnedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId","code")
);
CREATE INDEX IF NOT EXISTS "achievements_userId_idx" ON "achievements"("userId");

-- Done
SELECT 'v24.0 migration complete ✓' AS result;
