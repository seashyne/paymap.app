# v6.2.9 Runtime QA Sweep

## What was stabilized
- Normalized `accountMode` fallbacks across Settings, Billing, Wallets, Reports, Legal Center, and Pay Profile.
- Normalized `uiPreferences` reads before sending data to client components.
- Repointed `/guide` from dead `/demo/*` routes to real application routes (`/dashboard`, `/business`, `/merchant`).
- Updated legal company identity source to `PayMap Co., Ltd.` via `src/lib/tos-content.ts`.
- Updated app/package version to 6.2.9.

## Features that still require external configuration
- Stripe checkout / portal requires Stripe keys and valid customer records.
- Firebase login requires Firebase admin credentials.
- Upload flows require Cloudflare R2 configuration.
- Email sending requires Resend API key.
- AI advisor requires Anthropic API key.

## Recommended runtime QA order
1. Login (credentials + Firebase if enabled)
2. Dashboard / Wallets / Reports / Settings
3. Billing portal and checkout
4. Merchant POS / inventory / reports
5. Business payroll / leave / workspace
6. Pay Profile / legal pages / onboarding
