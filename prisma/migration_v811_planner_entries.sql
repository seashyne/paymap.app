-- PayMap v8.1.1 Planner Persistence Pack
CREATE TYPE "PlannerEntryKind" AS ENUM ('note','task','reminder');
CREATE TYPE "PlannerEntryStatus" AS ENUM ('open','done','archived');

CREATE TABLE IF NOT EXISTS "planner_entries" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "workspace" "AccountMode" NOT NULL DEFAULT 'personal',
  "kind" "PlannerEntryKind" NOT NULL DEFAULT 'note',
  "status" "PlannerEntryStatus" NOT NULL DEFAULT 'open',
  "title" TEXT NOT NULL,
  "content" TEXT,
  "dueAt" TIMESTAMP(3),
  "priority" INTEGER NOT NULL DEFAULT 2,
  "relatedPath" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "planner_entries_user_workspace_status_idx" ON "planner_entries" ("userId","workspace","status");
CREATE INDEX IF NOT EXISTS "planner_entries_dueAt_idx" ON "planner_entries" ("dueAt");
