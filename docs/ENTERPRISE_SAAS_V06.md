# PayMap v0.6 — Enterprise SaaS Upgrade

PayMap v0.6 expands the v0.5 multi-finance dashboard into an enterprise-ready structure.

## What changed from v0.5

- Added dedicated workspace routes:
  - `/dashboard` → Personal Finance
  - `/business` → Business Finance
  - `/enterprise` → Enterprise Finance
- Added reusable server-side dashboard data builder in `src/lib/dashboard-data.ts`
- Updated app metadata and branding to **v0.6**
- Refined workspace messaging from startup dashboard to enterprise-ready SaaS platform
- Added architecture guide for organization, RBAC, approval workflow, and governance roadmap

## Enterprise direction

### Personal Finance
- Income / expense tracking
- Budgets
- Savings goals
- Subscription management
- Tax planner

### Business Finance
- Revenue and operating cost visibility
- Expense control workspace
- Billing and recurring cost overview
- Cashflow-oriented dashboard
- Ready to extend to invoices and accounting export

### Enterprise Finance
- Executive summary workspace
- Audit / control placeholders
- Governance and policy messaging
- Ready for organization, approvals, RBAC, and compliance modules

## Recommended v0.6 backend roadmap

1. Add `organizations`, `organization_members`, and `organization_roles`
2. Introduce tenant scoping for enterprise records
3. Add `approval_requests`, `approval_steps`, and `audit_resources`
4. Add enterprise reporting exports
5. Add SSO / SCIM roadmap for v0.7+

## Recommended UI roadmap

1. Workspace-specific sidebars
2. Organization switcher
3. Team / department cards
4. Executive report center
5. Approval inbox

## Notes

This upgrade is intentionally safe for the existing v0.5 codebase:
- It preserves the current personal-finance functionality
- It layers business and enterprise workspaces on top of the same data foundations
- It avoids risky schema-breaking changes inside the shipped v0.6 ZIP
