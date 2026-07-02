# PayMap v7.3 Product UX Master

This pass upgrades core authenticated product surfaces to share the same premium section language introduced in v7.x.

## Included
- New shared product surface components: `ProductHero`, `ProductSection`, `ProductQuickLinks`
- New desktop-first product CSS tokens and section styling
- Upgraded pages: dashboard, business, merchant, reports, wallets, billing, settings, analytics, enterprise
- Upgraded utility modules: networth, simulation, achievements, installments, investments, loans, tax
- Version bump to 7.3.0

## Intent
The goal is to improve perceived quality and information hierarchy on PC without rewriting existing business logic or changing API flows.

## Notes
This is a shared surface overhaul. It intentionally wraps existing page logic instead of replacing module internals, which keeps risk lower while making the product look more consistent.
