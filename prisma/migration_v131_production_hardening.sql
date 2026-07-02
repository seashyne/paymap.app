-- PayMap v13.1 production hardening
-- Safe backfills + performance indexes for Financial OS / Business OS flows

INSERT INTO "organization_members" ("organizationId", "userId", "role", "joinedAt")
SELECT o."id", o."ownerId", 'owner', NOW()
FROM "organizations" o
LEFT JOIN "organization_members" m
  ON m."organizationId" = o."id" AND m."userId" = o."ownerId"
WHERE m."id" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_invoice_payments_invoice_paidAt" ON "invoice_payments" ("invoiceId", "paidAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_sales_orders_store_status_soldAt" ON "sales_orders" ("storeId", "status", "soldAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_payroll_runs_org_status_year_month" ON "payroll_runs" ("organizationId", "status", "year" DESC, "month" DESC);
CREATE INDEX IF NOT EXISTS "idx_merchant_products_store_status_minStock" ON "merchant_products" ("storeId", "status", "minStockQty", "stockQty");
CREATE INDEX IF NOT EXISTS "idx_vat_reports_store_year_month" ON "vat_reports" ("storeId", "year" DESC, "month" DESC);
