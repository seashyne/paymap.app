# PayMap v5.3.0 — Full Platform Baseline

## What is real in this build
- Invoice persistence with `Invoice`, `InvoiceItem`, and `InvoicePayment`
- Reconciliation statement import, matching, approval, and CSV export
- Subscription lifecycle with pause / resume / cancel-at-period-end semantics
- Tax support endpoints for supported-country discovery, VAT reports, and filing preview
- Dashboard wiring for business invoices, business reconciliation, merchant reconciliation, and billing operations
- Version bump to `5.3.0`, `TOS 2.3.0`, and `Privacy 2.3.0`

## Notes
- PayMap records, reconciles, and reports money flows. It does not custody funds.
- Stripe / bank / PromptPay remain the payment rails. PayMap consumes webhooks and accounting records.
- Schema changes require migration before production rollout.
