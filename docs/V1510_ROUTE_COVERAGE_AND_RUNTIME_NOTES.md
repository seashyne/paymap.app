# PayMap v15.1 — Route Coverage and Runtime Notes

## What changed
- Added a shared route registry at `src/lib/v151-route-map.ts` covering the route matrix for public, personal, business, merchant, enterprise, and admin areas.
- Upgraded the desktop command palette to search route metadata and support quick-jump shortcuts.
- Rebuilt `/guide` into a full route-oriented guide page using the shared registry.
- Extended `/status` with route coverage counts so runtime checks and route inventory can be reviewed together.
- Improved `/workspace/select` with route highlights for the current context.

## Quick-jump shortcuts
- `Ctrl/Cmd + K` → open command palette
- `G then D` → dashboard
- `G then B` → business
- `G then M` → merchant
- `G then P` → POS
- `G then S` → settings
- `G then W` → wallets
- `G then R` → reports
- `G then A` → analytics
- `G then H` → help

## Notes on verification
This pack improves route coverage, navigation surfaces, and guidance around the v15.1 structure. It still requires real dependency installation and runtime verification in a full local/dev environment to confirm build success, Prisma wiring, external services, and end-to-end auth/payment flows.
