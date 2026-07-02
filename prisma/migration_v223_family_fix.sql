-- v22.3: add missing Family workspace tables used by Personal dashboard APIs
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'THB',
  "ownerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'adult',
  nickname TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT family_members_familyId_userId_key UNIQUE ("familyId", "userId")
);

CREATE TABLE IF NOT EXISTS family_budgets (
  id TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS families_ownerId_idx ON families("ownerId");
CREATE INDEX IF NOT EXISTS family_members_userId_idx ON family_members("userId");
CREATE INDEX IF NOT EXISTS family_members_familyId_idx ON family_members("familyId");
CREATE INDEX IF NOT EXISTS family_budgets_familyId_year_month_idx ON family_budgets("familyId", year, month);
