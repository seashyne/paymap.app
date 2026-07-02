# PayMap v10.4 Deep Audit & Production Polish

This pass focuses on customer-facing polish and production hygiene.

## Applied fixes
- Updated app version to 10.4.0 and replaced remaining v9 badges on product pages.
- Cleaned public/auth copy so customers no longer see developer-oriented wording.
- Removed the register page dev-mode banner.
- Standardized planner client calls to `/api/personal/planner` and added route aliases.
- Standardized billing client calls to `/api/billing/*` and added route aliases for plans/history.
- Updated middleware protection lists to cover current billing/workspace/planner routes.
- Refined landing, login, register, and workspace copy for clearer customer messaging.

## Deep audit findings
1. Legacy routes still exist in parallel with new routes. Keep aliases temporarily, then remove `/api/stripe/*`, `/api/planner/entries/*`, and `/api/auth/switch-mode` after client migration is complete.
2. Planner data is still keyed by `userId + workspace` rather than a first-class `workspaceId`. This should be normalized in a future schema pass.
3. Billing, auth, and workspace flows still rely on runtime integrations (Stripe, Firebase, DB) that must be validated in a real environment.
4. Some docs still reference older versions; they are retained as historical release notes and are not shown in the customer UI.
5. Debug endpoints remain in the repo for operations. Restrict them behind admin-only access before production launch.

## Recommended next pass
- End-to-end runtime QA with bun build + seeded database.
- Remove legacy route tree after confirming client migration.
- Add Playwright coverage for login/register, switch workspace, planner CRUD, and billing flows.
