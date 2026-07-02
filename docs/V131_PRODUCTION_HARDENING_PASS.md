# PayMap v13.1 Production Hardening Pass

## What changed
- Tightened v13 Financial OS types and removed local `any` usage in the v13 summary surface.
- Exported `normalizeAccountMode()` and replaced unsafe `as any` account-mode casts on business / merchant workspace routes.
- Merchant POS page now handles "no store yet" state with a clear production setup path instead of acting like a placeholder.
- Merchant sales route now updates VAT reports when a sale is posted, then auto-posts the journal entry.
- Business payroll route now updates an existing payroll run for the same month/year instead of failing on duplicate creation, and preserves accounting posting if the run is already paid.
- Seed script now provisions default chart of accounts, owner organization memberships, sample business invoices/payments, and richer starter data for v13 flows.
- Added a migration script for owner-membership backfill and query indexes used by Financial OS dashboards.

## QA checklist by page

### `/business`
- [ ] New business user can create an organization.
- [ ] Organization owner is also visible in workspace members.
- [ ] Financial OS quick link opens successfully.
- [ ] Payroll and invoice summary cards load without runtime error.

### `/business/os`
- [ ] Dashboard loads with zero-data state when no org/store exists.
- [ ] KPI strip shows values without `NaN`.
- [ ] Forecast cards render three future months.
- [ ] Insight cards render with good/warn/critical states.
- [ ] Module links route to real app pages, not raw placeholder APIs.

### `/business/payroll`
- [ ] Create payroll run for month X/Y.
- [ ] Re-run the same month X/Y and confirm it updates the existing run.
- [ ] Approve a payroll run.
- [ ] Pay a payroll run and verify a journal entry exists.
- [ ] YTD withholding totals update on `/api/v13/payroll-ops`.

### `/business/accounting`
- [ ] Chart of accounts exists for a newly seeded demo workspace.
- [ ] Ledger / journal pages load without missing-account errors.
- [ ] Payroll-paid journal exists after paying a payroll run.

### `/merchant`
- [ ] New merchant user can create a store with starter kit products.
- [ ] Merchant overview cards reflect store/product counts.

### `/merchant/pos`
- [ ] No-store state shows setup CTA.
- [ ] Existing store shows product catalog and today's sales KPIs.
- [ ] Sales terminal link opens `/merchant/sales`.
- [ ] Accounting link opens `/merchant/accounting`.

### `/merchant/sales`
- [ ] Create a sale with 1+ products.
- [ ] Product stock is reduced.
- [ ] Inventory log is created.
- [ ] VAT report for that month is created or updated.
- [ ] Merchant sale journal entry is created.

### `/merchant/inventory`
- [ ] Create product.
- [ ] Edit product.
- [ ] Archive/delete product.
- [ ] Low-stock items surface correctly after sales.

### `/merchant/accounting`
- [ ] Journal count increases after POS sale.
- [ ] VAT report data is visible/consistent with sales volume.

## Recommended verification order
1. `npm install`
2. `npx prisma generate`
3. Apply migrations including `prisma/migration_v131_production_hardening.sql`
4. `npm run db:seed`
5. `npm run build`
6. Run smoke flows above in business and merchant modes.
