# PayMap v14.0 Architecture Refactor Pack

## Added
- New module boundaries under `src/modules`
- Shared event bootstrap for payroll and merchant accounting flows
- Service layer for financial summary, payroll ops, payroll upsert, merchant sale creation
- Seed chart-of-accounts moved under `prisma/`

## Updated routes
- `/api/v13/financial/summary`
- `/api/v13/business-insights`
- `/api/v13/payroll-ops`
- `/api/business/payroll`
- `/api/merchant/sales`

## Operational notes
- Run `bun run repo:validate`
- Run `bun run db:seed`
- Run `bun run build`
