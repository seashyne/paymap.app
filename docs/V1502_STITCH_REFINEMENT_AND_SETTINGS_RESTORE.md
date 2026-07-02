# PayMap 15.0.2 — Stitch refinement and settings restore

## What changed
- Refined the public landing page to match the cleaner desktop-first shell style.
- Improved the command palette with more useful actions and keyboard hints.
- Reworked the shared table system to better support search, sort, status chips, and empty states.
- Fixed the context switcher interaction so it opens reliably on click and closes on outside click / Esc.
- Restored the real Settings workflow by wiring the existing `SettingsClient` back into `/settings` instead of only showing a showcase surface.
- Updated workspace page titles and subtitles so each context feels distinct and closer to the stitch reference language.

## Important note
This pass focused on UI consistency, interaction cleanup, and restoring existing settings functionality.
Full runtime verification was not possible in this container because project dependencies and environment-backed services were not installed here.
