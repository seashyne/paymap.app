CREATE TABLE IF NOT EXISTS "warehouses" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "code" TEXT,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "note" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "warehouses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "warehouses_organizationId_code_key"
ON "warehouses"("organizationId", "code");

CREATE INDEX IF NOT EXISTS "warehouses_organizationId_deletedAt_name_idx"
ON "warehouses"("organizationId", "deletedAt", "name");

CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "sku" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "unit" TEXT DEFAULT 'ชิ้น',
  "barcode" TEXT,
  "costPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "salePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 7,
  "reorderPoint" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'THB',
  "status" "ProductStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "products_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_organizationId_sku_key"
ON "products"("organizationId", "sku");

CREATE INDEX IF NOT EXISTS "products_organizationId_deletedAt_name_idx"
ON "products"("organizationId", "deletedAt", "name");

CREATE INDEX IF NOT EXISTS "products_organizationId_status_reorderPoint_idx"
ON "products"("organizationId", "status", "reorderPoint");

CREATE TABLE IF NOT EXISTS "inventory_balances" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "qtyOnHand" INTEGER NOT NULL DEFAULT 0,
  "avgCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inventory_balances_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventory_balances_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "inventory_balances_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_balances_productId_warehouseId_key"
ON "inventory_balances"("productId", "warehouseId");

CREATE INDEX IF NOT EXISTS "inventory_balances_warehouseId_qtyOnHand_idx"
ON "inventory_balances"("warehouseId", "qtyOnHand");

CREATE TABLE IF NOT EXISTS "inventory_movement_logs" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "movement" "InventoryMovement" NOT NULL,
  "refType" "InventoryRef",
  "refId" TEXT,
  "qty" INTEGER NOT NULL,
  "qtyBefore" INTEGER NOT NULL,
  "qtyAfter" INTEGER NOT NULL,
  "unitCost" DECIMAL(12,2),
  "note" TEXT,
  "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inventory_movement_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventory_movement_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "inventory_movement_logs_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "inventory_movement_logs_productId_movedAt_idx"
ON "inventory_movement_logs"("productId", "movedAt");

CREATE INDEX IF NOT EXISTS "inventory_movement_logs_warehouseId_movedAt_idx"
ON "inventory_movement_logs"("warehouseId", "movedAt");
