-- PayMap v3.2.0 Performance + Database Index Pack
-- Postgres indexes focused on dashboard, notifications, reports, merchant POS,
-- and business payroll queries that were scanning larger ranges than needed.

CREATE INDEX IF NOT EXISTS "transactions_user_deleted_happened_idx"
  ON "transactions" ("userId", "deletedAt", "happenedAt" DESC);

CREATE INDEX IF NOT EXISTS "transactions_user_deleted_type_happened_idx"
  ON "transactions" ("userId", "deletedAt", "type", "happenedAt" DESC);

CREATE INDEX IF NOT EXISTS "transactions_user_category_happened_idx"
  ON "transactions" ("userId", "categoryId", "happenedAt" DESC);

CREATE INDEX IF NOT EXISTS "savings_goals_user_created_idx"
  ON "savings_goals" ("userId", "createdAt" ASC);

CREATE INDEX IF NOT EXISTS "subscriptions_user_status_next_billing_idx"
  ON "subscriptions" ("userId", "status", "nextBillingAt" ASC);

CREATE INDEX IF NOT EXISTS "notifications_user_created_idx"
  ON "notifications" ("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "notifications_user_read_created_idx"
  ON "notifications" ("userId", "readAt", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "leave_requests_org_status_created_idx"
  ON "leave_requests" ("organizationId", "status", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "payroll_runs_org_year_month_idx"
  ON "payroll_runs" ("organizationId", "year", "month");

CREATE INDEX IF NOT EXISTS "stores_user_created_idx"
  ON "stores" ("userId", "createdAt" ASC);

CREATE INDEX IF NOT EXISTS "merchant_products_store_status_stock_idx"
  ON "merchant_products" ("storeId", "status", "stockQty" ASC);

CREATE INDEX IF NOT EXISTS "sales_orders_store_status_sold_idx"
  ON "sales_orders" ("storeId", "status", "soldAt" DESC);

CREATE INDEX IF NOT EXISTS "sales_items_product_idx"
  ON "sales_items" ("productId");

CREATE INDEX IF NOT EXISTS "assets_user_asof_idx"
  ON "assets" ("userId", "asOfDate" DESC);

CREATE INDEX IF NOT EXISTS "liabilities_user_asof_idx"
  ON "liabilities" ("userId", "asOfDate" DESC);
