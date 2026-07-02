# PayMap v4 — Performance + Database Index Pack

## What changed

### 1) Server-side caching
- Added `src/lib/server-cache.ts`
- Cached public landing stats for 1 hour
- Cached merchant dashboard snapshot for 60 seconds per store
- Cached business dashboard snapshot for 60 seconds per organization

### 2) Lower query cost on dashboards
- Reused cached merchant/business snapshots in:
  - `src/app/merchant/page.tsx`
  - `src/app/w/[slug]/dashboard/page.tsx`
- Optimized `src/lib/dashboard-data.ts`
  - 6-month cashflow is now reduced in one pass instead of repeated array filtering
  - category metadata is reused from already-loaded categories instead of doing one more category query

### 3) Notifications API
- `src/app/api/notifications/route.ts`
- unread count now uses `count()` directly instead of calculating from only the latest 30 rows
- improves correctness and scales better with many notifications

### 4) Database indexes
Added schema indexes and raw SQL migration in:
- `prisma/schema.prisma`
- `prisma/migration_v320_performance_indexes.sql`

Main targets:
- transactions by user + deletedAt + happenedAt
- transactions by user + type + happenedAt
- subscriptions due soon lookups
- notifications unread + newest first
- payroll monthly lookup
- merchant stock and sales date/status lookups
- assets/liabilities by snapshot date

## Why this helps
- lower DB load on dashboard refreshes
- faster repeat visits for public landing page
- cheaper merchant/business overview rendering
- better query plan selection for the heaviest Prisma filters

## Apply steps
1. Update envs as usual
2. Run:

```bash
npm install
npx prisma generate
npx prisma db push
```

If you manage SQL manually, also apply:

```bash
psql "$DATABASE_URL" -f prisma/migration_v320_performance_indexes.sql
```

Then build and test:

```bash
npm run build
npm run start
```

## Important note
This pack is based on static project inspection. It improves obvious hot paths and indexing gaps, but it is not a substitute for:
- Prisma query logging in staging
- Postgres `EXPLAIN ANALYZE`
- Lighthouse / Web Vitals checks
- production tracing

## Recommended next pack
- Prisma query log review + N+1 cleanup
- search optimization with Postgres trigram indexes for `contains` queries
- Redis caching for expensive shared dashboards
- paginated reports for large datasets
