# PayMap v6.2.6 Template-aware Module Surfaces Pass

## What changed
- Added template-aware module surface mapping for:
  - wallets
  - billing
  - settings
  - reports center
  - reports/financial
- Updated landing copy to reflect the v6.2.6 positioning around four main templates.
- Bumped app/package version strings to v6.2.6 on core surfaces.

## New files
- `src/lib/ui-template-modules.ts`
- `src/components/ui/TemplateModuleSurface.tsx`

## Updated files
- `src/lib/app-version.ts`
- `src/app/page.tsx`
- `src/app/wallets/page.tsx`
- `src/components/finance/WalletsClient.tsx`
- `src/app/billing/page.tsx`
- `src/components/billing/BillingClient.tsx`
- `src/app/settings/page.tsx`
- `src/app/settings/SettingsClient.tsx`
- `src/app/reports/page.tsx`
- `src/app/reports/financial/page.tsx`
- selected version-label pages updated to v6.2.6 strings

## Functional effect
- The selected template now changes hero copy, support cards, CTA links, and empty-state messaging on key module surfaces.
- Wallets primary/secondary button labels adapt by template context.
- Billing hero and empty state adapt by template context.
- Settings surfaces now carry template-aware framing before deeper controls.
- Reports center and financial statements now show template-aware intro copy and support cards.

## Validation notes
- Static code sweep completed on the edited files.
- Full production build was not completed in this container because project dependencies and Prisma runtime were not installed here.
- Recommended local validation after unzip:
  - `npm install`
  - `npx prisma generate`
  - `npm run build`
