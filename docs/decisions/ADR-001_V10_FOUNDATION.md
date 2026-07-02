# ADR-001: Introduce v10 layered architecture without breaking current routes

## Decision
Introduce new `features`, `shared`, and `server` layers while keeping current route paths stable.

## Reason
The project has accumulated many features quickly. A hard cutover would be risky, so v10 uses a staged migration model.

## Consequences
- Existing imports continue to work
- New code must prefer v10 folders
- Old folders can be progressively converted into re-export shims
