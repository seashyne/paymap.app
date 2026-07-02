# PayMap v11.2 Shared Dashboard Module Pack

This pack extracts reusable dashboard modules from versioned component folders into shared component namespaces.

## Moved to shared dashboard
- UnifiedModeOverview
- ConsentStatusPanel
- ModuleGrid

## Moved to shared workbench
- BillingOperationsWorkbench
- InvoiceWorkbench
- ReconciliationWorkbench
- workbench shared helpers

## Updated routes/pages
Business, Merchant, and Enterprise pages now import shared modules from `src/shared/components/*` rather than versioned dashboard folders.

## Repo cleanup
Legacy versioned folders `dashboard-v51`, `dashboard-v52`, and `dashboard-v53` were moved under `src/components/legacy/dashboard/modules/`.
