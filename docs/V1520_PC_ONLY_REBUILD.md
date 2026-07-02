# PayMap v15.2 — PC Only Rebuild

## What changed
- Enforced desktop-only usage with middleware redirect for mobile/tablet user agents.
- Added client-side desktop guard for narrow/touch devices to redirect to `/download`.
- Removed mobile bottom navigation from the app shell to keep the product PC-only.
- Updated app/package version to 15.2.0.
- Reworked `/download` into a desktop-only landing page that explains the PC policy.
- Upgraded merchant POS terminal to call `/api/merchant/sales` on checkout so sales and inventory can be persisted.

## Still requires runtime verification
- Full `next build` and `prisma generate` in the real project environment.
- End-to-end verification for auth, billing, payroll, and every admin/business/merchant flow.
- Browser QA on desktop widths >= 1180px.
