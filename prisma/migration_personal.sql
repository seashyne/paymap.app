-- payMap Personal - New tables migration
-- Run this after: npx prisma db push
-- Or use: npx prisma migrate dev --name personal_features

-- Budget Planner
CREATE TABLE IF NOT EXISTS "budgets" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "categoryId"  TEXT NOT NULL,
    "month"       INTEGER NOT NULL,
    "year"        INTEGER NOT NULL,
    "limitAmount" DECIMAL(12,2) NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "budgets_userId_categoryId_month_year_key" UNIQUE ("userId","categoryId","month","year"),
    CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "budgets_userId_year_month_idx" ON "budgets"("userId","year","month");

-- Savings Goals
CREATE TABLE IF NOT EXISTS "savings_goals" (
    "id"           TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "savedAmount"  DECIMAL(12,2) NOT NULL DEFAULT 0,
    "icon"         TEXT DEFAULT '🎯',
    "color"        TEXT DEFAULT '#f59e0b',
    "deadline"     TIMESTAMP(3),
    "completedAt"  TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "savings_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "savings_goals_userId_idx" ON "savings_goals"("userId");

-- Savings Deposits
CREATE TABLE IF NOT EXISTS "savings_deposits" (
    "id"        TEXT NOT NULL,
    "goalId"    TEXT NOT NULL,
    "amount"    DECIMAL(12,2) NOT NULL,
    "note"      TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "savings_deposits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "savings_deposits_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "savings_goals"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "savings_deposits_goalId_idx" ON "savings_deposits"("goalId");

-- Subscriptions
CREATE TYPE IF NOT EXISTS "BillingCycle" AS ENUM ('daily','weekly','monthly','quarterly','yearly');
CREATE TYPE IF NOT EXISTS "SubStatus"    AS ENUM ('active','paused','cancelled');

CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "amount"        DECIMAL(10,2) NOT NULL,
    "billingCycle"  "BillingCycle" NOT NULL DEFAULT 'monthly',
    "nextBillingAt" TIMESTAMP(3) NOT NULL,
    "logo"          TEXT,
    "color"         TEXT,
    "note"          TEXT,
    "status"        "SubStatus" NOT NULL DEFAULT 'active',
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "subscriptions_userId_status_idx"      ON "subscriptions"("userId","status");
CREATE INDEX IF NOT EXISTS "subscriptions_userId_nextBilling_idx" ON "subscriptions"("userId","nextBillingAt");
