-- PayMap v14 Architecture Refactor — Migration
-- Generated: 2026-03-20
-- BUG-006 fix: migration file was missing for v14 pack
--
-- This migration covers schema additions from the v14 modular architecture refactor.
-- Run: psql $DATABASE_URL < prisma/migration_v14_architecture_refactor.sql
--   OR: npx prisma migrate dev --name v14_architecture_refactor
--
-- NOTE: If running prisma migrate dev, this SQL file is for reference only.
-- Prisma will auto-generate the correct migration from schema diff.

-- ── Event log table (platform/events module) ─────────────────────────────────
-- Stores published domain events for auditability and replay
CREATE TABLE IF NOT EXISTS "DomainEvent" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "type"        TEXT NOT NULL,
  "payload"     JSONB NOT NULL DEFAULT '{}',
  "workspaceId" TEXT,
  "userId"      TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DomainEvent_type_idx" ON "DomainEvent"("type");
CREATE INDEX IF NOT EXISTS "DomainEvent_workspaceId_idx" ON "DomainEvent"("workspaceId");
CREATE INDEX IF NOT EXISTS "DomainEvent_createdAt_idx" ON "DomainEvent"("createdAt");

-- ── Verify existing critical tables are present ───────────────────────────────
-- These should already exist from previous migrations. 
-- If any DO NOT exist, run the corresponding migration file first:
--   Family        → prisma/migration_family.sql
--   FamilyMember  → prisma/migration_family.sql
--   FamilyBudget  → prisma/migration_family.sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Family') THEN
    RAISE WARNING 'Table "Family" missing — run prisma/migration_family.sql first';
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'PlannerEntry') THEN
    RAISE WARNING 'Table "PlannerEntry" missing — run prisma/migration_v811_planner_entries.sql first';
  END IF;
END $$;
