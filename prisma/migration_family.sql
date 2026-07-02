-- v1.4: Family workspace tables

CREATE TYPE "FamilyRole" AS ENUM ('owner', 'spouse', 'adult', 'child');

CREATE TABLE "families" (
    "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name"      TEXT NOT NULL,
    "ownerId"   TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "currency"  TEXT NOT NULL DEFAULT 'THB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "family_members" (
    "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "familyId"  TEXT NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
    "userId"    TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role"      "FamilyRole" NOT NULL DEFAULT 'adult',
    "nickname"  TEXT,
    "joinedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("familyId", "userId")
);

CREATE TABLE "family_budgets" (
    "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "familyId"  TEXT NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
    "category"  TEXT NOT NULL,
    "amount"    DECIMAL(12,2) NOT NULL,
    "month"     INTEGER NOT NULL,
    "year"      INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("familyId", "category", "month", "year")
);

CREATE INDEX ON "families"("ownerId");
CREATE INDEX ON "family_members"("userId");
