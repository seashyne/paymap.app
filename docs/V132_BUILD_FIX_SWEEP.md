# PayMap v13.2 Build-Fix Sweep

## What changed
- Hardened v13 reporting logic so monthly P/L and COGS use current-month orders instead of the latest few orders across all time.
- Hardened forecast logic so payroll history uses `month` + `year` instead of `createdAt`.
- Hardened merchant sales route so duplicate product lines are merged before stock checks and inventory updates.
- Hardened payroll route so payroll cannot run with zero active employees.
- Fixed `prisma/seed.ts` typing issues and updated the seeding banner/version.
- Corrected `prisma/migration_v131_production_hardening.sql` identifiers to match the Prisma schema naming used by this repo.
- Added `prisma/migration_v132_build_fix_sweep.sql` for VAT report baseline backfill.
- Expanded `scripts/smoke-test.ts` to support endpoint-level smoke checks with `SMOKE_BASE_URL`.

## QA checklist by page / flow

### 1) Auth + session
- Login with `demo@paymap.th / Demo1234`
- Login with `biz@paymap.th / Demo1234`
- Login with `shop@paymap.th / Demo1234`
- Verify logout clears session and protected pages redirect

### 2) Financial OS `/business/os`
- Summary cards load without 500 errors
- Cash in = invoice collected + merchant sales total
- Net profit reflects current month only
- Forecast cards load 3 months forward
- Empty-state cards appear when org/store is missing

### 3) Payroll `/business/payroll`
- Create payroll run for current month
- Re-run same month and confirm the run is updated, not duplicated
- Verify zero-employee org returns a validation message instead of creating a broken run
- Mark paid flow should still create accounting posting

### 4) Merchant POS `/merchant/pos`
- With no store: setup CTA is visible
- With a store: today sales, orders, and catalog counts render
- Create sale with one item
- Create sale with duplicate lines for same product and verify stock decreases only once by total qty
- Sale updates VAT report and posts journal

### 5) Inventory `/merchant/inventory`
- Product list loads
- Low-stock items appear when `stockQty <= minStockQty`
- Inventory movement history renders after a sale

### 6) Accounting `/business/accounting` and `/merchant/accounting`
- Journal list loads
- POS sale posting appears in journal
- Payroll paid posting appears in journal
- Chart of accounts exists for seeded users

### 7) Seed + migration
- Run `npx prisma generate`
- Apply SQL in order, then run `npm run db:seed`
- Confirm seeded org, store, invoice payment, payroll run, VAT report, and merchant demo order exist

## Suggested command sequence
```bash
npm install
npx prisma generate
# apply prisma/migration.sql + follow-up migration files used by your environment
npm run db:seed
npm run build
SMOKE_BASE_URL=http://localhost:3000 npm run smoke
```

## Known limitation
This pass hardens the v13/v13.1 code path and fixes schema/migration inconsistencies found in the added SQL files. It does not claim every legacy route outside the v13-focused surface has been fully revalidated in this container.
