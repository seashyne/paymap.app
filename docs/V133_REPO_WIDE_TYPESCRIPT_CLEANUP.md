# PayMap v13.3 Repo-wide TypeScript Cleanup

## Scope
- normalize theme typing so Settings + ThemeToggle + AppShell share the same `ThemeMode` union
- reduce `any` usage in reconciliation workbench flows
- add repo validation script for schema / seed / v13 route presence
- expand smoke test list to cover business + merchant + v13 endpoints

## Hardening highlights
1. **Theme mode consistency**
   - `executive` now works across ThemeToggle, compact header toggle, Settings, and AppShell hydration
   - executive mode now keeps the document in dark-class mode for CSS that depends on dark selectors

2. **Workbench typing cleanup**
   - reconciliation result shape is typed instead of `any`
   - match id extraction now uses a string type guard
   - shared `apiJson` default generic changed from `any` to `unknown`

3. **Validation utilities**
   - `npm run repo:validate` checks the core schema / seed / migration / v13 route files expected by this build
   - `npm run smoke` now covers more authenticated and public API surfaces

## Recommended local verification
```bash
npm install
npx prisma generate
npm run repo:validate
npm run db:seed
npm run build
SMOKE_BASE_URL=http://localhost:3000 npm run smoke
```

## Smoke checklist by flow
- login/register/reset-password
- dashboard summary / notifications / quick add
- business OS, payroll, invoices, accounting, reconciliation
- merchant POS, inventory, sales posting, accounting sync
- v13 forecast / insights / payroll ops
- reports, billing, settings, workspace selection

## Known limitation in this environment
This pass improves repo consistency and removes several obvious type mismatches, but a full `next build` still must be run in the target machine with dependencies installed.
