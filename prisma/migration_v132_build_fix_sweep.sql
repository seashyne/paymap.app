-- PayMap v13.2 build-fix sweep
-- Validation-oriented cleanup for seed + reporting flows.

-- Ensure seeded demo store starter VAT row exists when the store exists.
INSERT INTO "vat_reports" ("id", "storeId", "month", "year", "salesVat", "purchaseVat", "vatPayable", "totalSales", "totalPurchases", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), s."id", EXTRACT(MONTH FROM NOW())::int, EXTRACT(YEAR FROM NOW())::int, 0, 0, 0, 0, 0, NOW(), NOW()
FROM "stores" s
WHERE NOT EXISTS (
  SELECT 1 FROM "vat_reports" v
  WHERE v."storeId" = s."id"
    AND v."month" = EXTRACT(MONTH FROM NOW())::int
    AND v."year" = EXTRACT(YEAR FROM NOW())::int
);
