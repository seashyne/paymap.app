CREATE TABLE IF NOT EXISTS "customers" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "customerCode" TEXT,
  "name" TEXT NOT NULL,
  "contactName" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "taxId" TEXT,
  "branchName" TEXT,
  "branchCode" TEXT,
  "address" TEXT,
  "paymentTerms" INTEGER DEFAULT 30,
  "currency" TEXT NOT NULL DEFAULT 'THB',
  "note" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "customers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "customers_organizationId_customerCode_key"
ON "customers"("organizationId", "customerCode");

CREATE INDEX IF NOT EXISTS "customers_organizationId_isActive_idx"
ON "customers"("organizationId", "isActive");

CREATE INDEX IF NOT EXISTS "customers_organizationId_deletedAt_name_idx"
ON "customers"("organizationId", "deletedAt", "name");

ALTER TABLE "quotations"
ADD COLUMN IF NOT EXISTS "customerId" TEXT;

ALTER TABLE "invoices"
ADD COLUMN IF NOT EXISTS "customerId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'quotations_customerId_fkey'
  ) THEN
    ALTER TABLE "quotations"
    ADD CONSTRAINT "quotations_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_customerId_fkey'
  ) THEN
    ALTER TABLE "invoices"
    ADD CONSTRAINT "invoices_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "quotations_customerId_idx" ON "quotations"("customerId");
CREATE INDEX IF NOT EXISTS "invoices_customerId_idx" ON "invoices"("customerId");
