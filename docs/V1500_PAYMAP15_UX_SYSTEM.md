# PayMap 15 UX System Pack

## What changed
- Rebuilt the app shell around **context switching** instead of destructive mode switching.
- Added a **desktop-first command palette** with navigation, create actions, and context jump.
- Reworked the primary workspaces for **Personal, Business, Merchant, Enterprise, Analytics, and Settings**.
- Added a new **table system** with search and sort as the default surface for operations-heavy pages.
- Added a **merchant POS surface** focused on larger click targets, keyboard shortcuts, and perceived latency feedback.
- Reframed settings as a **Settings Hub** instead of a long mixed form page.
- Added **AI assist rails** and advanced analytics surfaces in each major context.

## Core UX principles
1. One shell, many contexts.
2. Desktop-first information density.
3. Actions close to data.
4. Table + insights + analytics as the base workspace pattern.
5. Consistent visual grammar across every mode.

## Main files added or changed
- `src/components/layout/ContextSwitcher.tsx`
- `src/components/ui/GlobalSearch.tsx`
- `src/components/ui/TableSystem.tsx`
- `src/components/v15/workspace-kit.tsx`
- `src/components/layout/AppFrame.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/business/page.tsx`
- `src/app/merchant/page.tsx`
- `src/app/enterprise/page.tsx`
- `src/app/analytics/page.tsx`
- `src/app/settings/page.tsx`

## Notes
This pack focuses on production-ready UX structure and front-end workflow surfaces. It is designed to be extended further into route-level CRUD flows, API actions, and deeper persistence rules already present in the repo.
