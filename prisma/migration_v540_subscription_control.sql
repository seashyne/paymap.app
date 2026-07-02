-- PayMap v5.4 Subscription Control System
CREATE TABLE IF NOT EXISTS "plan_features" (
  "id" TEXT PRIMARY KEY,
  "product" TEXT NOT NULL,
  "planCode" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "plan_features_product_planCode_feature_key"
  ON "plan_features" ("product", "planCode", "feature");

CREATE INDEX IF NOT EXISTS "plan_features_product_planCode_idx"
  ON "plan_features" ("product", "planCode");
