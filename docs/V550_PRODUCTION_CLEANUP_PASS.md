# PayMap v5.5 Production Cleanup Pass

## What changed

- Unified displayed plan across Billing, Settings, Reports, Business, and Merchant screens by preferring active `productSubscriptions` over legacy `user.plan`.
- Removed the legacy recurring-subscription workbench from the billing page to keep the production UI focused on real Stripe flows.
- Added real purchase history support:
  - `GET /api/stripe/history`
  - Billing page purchase history + subscription status cards
  - Stripe webhook now records `invoice.paid` into `stripe_payments`
- Reduced desktop overflow risk:
  - simplified sidebar footer
  - removed duplicated heavy header actions from the sidebar
  - added more `min-w-0` / wrapped action areas in key billing panels
- Updated branding/version strings to v5.5 on core screens.
- Cleaned dashboard legacy labels (`v0.8`, `v0.7`) into user-facing production wording.
- Expanded Settings and Pay Profile editors for desktop with wider layouts.

## Remaining production checks

1. Run Stripe test checkout and confirm `invoice.paid` reaches `/api/stripe/webhook`.
2. Confirm `stripe_payments` rows appear after successful payment.
3. Verify all Stripe price IDs exist for every plan shown in Billing.
4. Review pages that still use older internal workbench UIs and continue migrating them to the new design system.
