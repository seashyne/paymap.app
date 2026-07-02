# PayMap v12.0.1 homepage hotfix

- Removed the fake overview/KPI preview block from the public landing page.
- Removed hard-coded sample numbers and statuses from the hero preview surface.
- Kept only workspace cards on the right side of the hero for a cleaner production-facing landing page.
- Replaced the public header version chip with a neutral global badge.

Recommended after applying:
- delete `.next`
- run `bun install`
- run `bunx prisma generate`
- run `bun run build`
- hard refresh the browser
