# PayMap v13 — Financial OS + Business OS for SME

## Added
- New owner cockpit at `/business/os` for cashflow, net profit, tax impact, forecast, and AI-style business insights.
- New desktop-first POS page at `/merchant/pos` for quick catalog, daily sales visibility, and order review.
- New v13 APIs:
  - `/api/v13/financial/summary`
  - `/api/v13/financial/forecast`
  - `/api/v13/business-insights`
  - `/api/v13/payroll-ops`
- Auto-post accounting hooks:
  - Merchant sales now auto-post journal entries.
  - Payroll runs now auto-post journal entries when marked paid.

## Core scope delivered
- Financial dashboard for SME owner view
- Production-oriented accounting engine linkage
- Payroll + tax automation visibility
- Merchant/POS + inventory lite linkage
- Multi-user / RBAC surfaced as a core operating module

## Notes
- This pack reuses the existing Prisma schema and current workspace structure to avoid a disruptive migration.
- Chart of accounts are provisioned automatically when auto-posting needs system accounts.
- External package installation/build verification was not possible in this environment, so this release is delivered as source-level implementation pack.
