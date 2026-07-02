# PayMap v6.2.5 Template Content Mapping Pass

## What changed
- Added template-aware content mapping layer for Personal / Business / Merchant / Family.
- Template now changes:
  - hero copy on main pages
  - KPI priority/order and KPI labels on the personal dashboard
  - quick action set
  - recommended widget cards
  - default navigation labels in AppFrame
- Business, Merchant, and Reports pages now use template-aware page titles/subtitles.
- Added shared `TemplateRecommendedWidgets` block for main workspaces.

## New files
- `src/lib/ui-template-content.ts`
- `src/components/dashboard/TemplateRecommendedWidgets.tsx`

## Updated files
- `src/components/layout/AppFrame.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/business/page.tsx`
- `src/app/merchant/page.tsx`
- `src/app/reports/page.tsx`
- `src/components/dashboard/QuickActions.tsx`
- `src/components/dashboard/RecommendedSetup.tsx`
- `src/components/dashboard/WalletSummaryLite.tsx`

## Notes
- This pass focuses on high-traffic entry points and shared shell/nav behavior.
- It does not yet rewrite every legacy subpage component with a unique template-specific body layout.
