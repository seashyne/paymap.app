# PayMap v10 Production Architecture Foundation

PayMap v10 is a production-oriented SaaS foundation for Personal, Business, and Merchant workspaces.

## What changed in this pack
- Introduced v10 folder architecture: `app`, `features`, `shared`, `server`, `middleware`, `instrumentation`
- Added server-side service/repository foundation
- Added shared design system entrypoints and alias paths
- Added environment verification and smoke-test scripts
- Added architecture docs, migration roadmap, and runbooks
- Preserved backward compatibility with the existing v9 route surface where possible

## Commands
```bash
npm install
npm run verify-env
npm run typecheck
npm run build
npm run smoke
```

## Important note
This pack is a **v10 foundation refactor pack**, not a claim that every existing feature has been fully migrated to the new folder layout. Existing v9 routes still remain in place for compatibility, while the new v10 structure is ready for progressive migration.


## v11.2
Shared dashboard modules extracted into `src/shared/components` to reduce versioned UI folders in the main repo surface.
