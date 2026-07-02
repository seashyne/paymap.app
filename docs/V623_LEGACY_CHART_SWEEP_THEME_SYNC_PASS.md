# PayMap v6.2.3 — Legacy Chart Sweep + Theme Sync Pass

## What changed
- Added `themeMode` into persisted UI preferences and default sanitization flow.
- Theme changes now update DB-backed UI preferences via partial PATCH and set a `paymap-theme` cookie for SSR-safe first paint.
- Root layout now reads the cookie and applies dark/light/system/executive before hydration.
- Settings > Appearance now exposes DB-synced theme selection.
- `/reports/financial` now respects `showCharts` for legacy visual summary blocks.
- Secondary visual blocks in `/analytics` and enterprise overview now respect chart preference with fallback states.

## Operational notes
- No Prisma schema migration is required because the new value is stored inside the existing `users.uiPreferences` JSON field.
- Existing users will fall back to `themeMode = dark` until they save or toggle theme once.
