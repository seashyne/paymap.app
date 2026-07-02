# PayMap 15.0.1 Full Zip UI System Pack

This pack refreshes the public landing page and the main v15 shell so the product feels visually consistent from the first screen through the core workspaces.

Included in this pass:
- Landing page rewritten to match the submitted visual direction without fake stats
- Refined theme variables and marketing utility classes in `src/app/globals.css`
- Table system alignment fix and visual polish in `src/components/ui/TableSystem.tsx`
- Command palette links updated for the merchant POS surface
- New merchant POS workbench in `src/components/merchant/PosTerminalV15.tsx`
- `src/app/merchant/pos/page.tsx` moved to the new v15 shell and interactive terminal

Notes:
- This is a code pack and UX pass. It was not fully build-verified in this container because the project toolchain and dependencies were not installed here.
- Data-backed pages still depend on the existing PayMap database schema and environment configuration.
