# PayMap v15.3.1 — High-Risk Route Closure

## Closed in this pass
- `/admin/workspaces`
  - moved from passive server list to managed client surface
  - added search, status filter, refresh, and live status update via `PATCH /api/admin/workspaces`
- `/admin/audit`
  - added searchable/filterable audit center
  - API now supports `q`, `action`, and `limit`
- `/enterprise/reports`
  - removed null-summary gap when `orgId` is absent
  - API now returns aggregate enterprise summary across all accessible organizations
  - page now supports all-org view and per-org drill-down
- `/billing`
  - added runtime billing history panel backed by `/api/billing/history`
  - billing portal now falls back to `/billing#history` when Stripe is not configured yet
- `/pay/[slug]`
  - added public payment intent API at `/api/public/pay/[slug]`
  - public pay page can now create a real PromptPay QR URL without requiring auth

## Regression notes
- admin APIs now support filtering and patch flows that are exercised by the new route surfaces
- enterprise reports no longer require a forced org selection just to render usable data
- billing portal is resilient in local/dev environments
- pay profile public flow no longer depends on an authenticated PromptPay endpoint

## Remaining recommended sweep
- run `prisma generate && next build`
- test role guard behavior for admin and enterprise pages
- verify data models contain `WorkspaceStatus` values used by the admin workspace manager
- test public pay profile with valid PromptPay IDs and preset/custom amounts
