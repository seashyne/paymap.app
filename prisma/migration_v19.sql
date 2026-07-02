-- v1.9 Schema Migration
-- Run AFTER: npx prisma db push OR manually on production

-- ─── 1. New Enums ────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "InventoryMovement" AS ENUM ('in', 'out', 'adjust', 'return');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "InventoryRef" AS ENUM ('sale', 'purchase', 'adjustment', 'writeoff');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'qr', 'transfer', 'card', 'credit');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "RecurringInterval" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add apple to AuthProvider enum
ALTER TYPE "AuthProvider" ADD VALUE IF NOT EXISTS 'apple';

-- ─── 2. Migrate String → Enum (safe: keep old data, cast where possible) ─────
-- InventoryLog
ALTER TABLE inventory_logs ALTER COLUMN type TYPE "InventoryMovement"
  USING CASE type
    WHEN 'in'     THEN 'in'::"InventoryMovement"
    WHEN 'out'    THEN 'out'::"InventoryMovement"
    WHEN 'adjust' THEN 'adjust'::"InventoryMovement"
    WHEN 'return' THEN 'return'::"InventoryMovement"
    ELSE 'adjust'::"InventoryMovement"
  END;

ALTER TABLE inventory_logs ALTER COLUMN ref_type TYPE "InventoryRef"
  USING CASE ref_type
    WHEN 'sale'        THEN 'sale'::"InventoryRef"
    WHEN 'purchase'    THEN 'purchase'::"InventoryRef"
    WHEN 'adjustment'  THEN 'adjustment'::"InventoryRef"
    WHEN 'writeoff'    THEN 'writeoff'::"InventoryRef"
    ELSE NULL
  END;

-- SalesOrder paymentMethod
ALTER TABLE sales_orders ALTER COLUMN payment_method TYPE "PaymentMethod"
  USING CASE payment_method
    WHEN 'cash'     THEN 'cash'::"PaymentMethod"
    WHEN 'qr'       THEN 'qr'::"PaymentMethod"
    WHEN 'transfer' THEN 'transfer'::"PaymentMethod"
    WHEN 'card'     THEN 'card'::"PaymentMethod"
    WHEN 'credit'   THEN 'credit'::"PaymentMethod"
    ELSE NULL
  END;

-- RecurringTransaction interval
ALTER TABLE recurring_transactions ALTER COLUMN interval TYPE "RecurringInterval"
  USING CASE interval
    WHEN 'daily'     THEN 'daily'::"RecurringInterval"
    WHEN 'weekly'    THEN 'weekly'::"RecurringInterval"
    WHEN 'monthly'   THEN 'monthly'::"RecurringInterval"
    WHEN 'quarterly' THEN 'quarterly'::"RecurringInterval"
    WHEN 'yearly'    THEN 'yearly'::"RecurringInterval"
    ELSE 'monthly'::"RecurringInterval"
  END;

-- ─── 3. Soft Delete columns ───────────────────────────────────────────────────
ALTER TABLE transactions     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE employees        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices         ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE organizations    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE sales_orders     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ─── 4. Notification TTL + updatedAt ─────────────────────────────────────────
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Set TTL on existing notifications (90 days from created_at)
UPDATE notifications SET expires_at = created_at + INTERVAL '90 days' WHERE expires_at IS NULL;

-- ─── 5. SalesOrder updatedAt ─────────────────────────────────────────────────
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── 6. Decimal precision fixes ──────────────────────────────────────────────
ALTER TABLE leave_balances ALTER COLUMN entitled  TYPE DECIMAL(6,2);
ALTER TABLE leave_balances ALTER COLUMN used      TYPE DECIMAL(6,2);
ALTER TABLE leave_balances ALTER COLUMN remaining TYPE DECIMAL(6,2);
ALTER TABLE leave_requests ALTER COLUMN days      TYPE DECIMAL(6,2);
ALTER TABLE payroll_items  ALTER COLUMN ot_hours  TYPE DECIMAL(8,2);

-- ─── 7. Cleanup indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS transactions_deleted_at_idx     ON transactions(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS employees_deleted_at_idx        ON employees(organization_id, deleted_at);
CREATE INDEX IF NOT EXISTS invoices_deleted_at_idx         ON invoices(organization_id, deleted_at);
CREATE INDEX IF NOT EXISTS organizations_deleted_at_idx    ON organizations(owner_id, deleted_at);
CREATE INDEX IF NOT EXISTS merchant_products_deleted_at_idx ON merchant_products(store_id, deleted_at);
CREATE INDEX IF NOT EXISTS sales_orders_deleted_at_idx     ON sales_orders(store_id, deleted_at);
CREATE INDEX IF NOT EXISTS notifications_expires_at_idx    ON notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS sessions_expires_idx            ON sessions(expires);
CREATE INDEX IF NOT EXISTS tokens_expires_at_idx           ON tokens(expires_at);

-- ─── 8. Auto-cleanup expired notifications (trigger or cron) ─────────────────
-- Called by a cron job or app startup — deletes rows older than TTL
-- CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
-- RETURNS void LANGUAGE sql AS $$
--   DELETE FROM notifications WHERE expires_at < NOW();
-- $$;

-- v2.1: Add receiptUrl to transactions for R2 storage
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT;
