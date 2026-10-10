# 04: Settings dialog

**What to build:** A settings dialog that lets the user pick a theme (Classic / Emerald / Ink) and an appearance mode (System / Light / Dark). Both selections are persisted in localStorage. Changes apply instantly across the entire app.

The dialog combines both the theme axis and the appearance axis into a single UI. The theme selector shows visual previews of each theme. The appearance selector offers the three options with a clear indicator of what System means (follows OS preference).

**Blocked by:** 02 (dark mode), 03 (additional themes)

**Status:** ready-for-agent

- [ ] Settings dialog UI with theme selector (Classic / Emerald / Ink, with visual previews)
- [ ] Appearance selector (System / Light / Dark, with clear System explanation)
- [ ] Both selections persisted in localStorage (`sudoku:theme` and `sudoku:appearance`)
- [ ] Theme + appearance changes apply instantly (no page reload)
- [ ] Default values: Classic theme, System appearance (reads from localStorage or falls back to defaults)
- [ ] Dialog is sized dynamically to fit its content: no crowding, no text overflow, no clipped previews
- [ ] Dialog does not overflow the viewport: if content exceeds viewport height, the dialog scrolls internally (fixed dialog frame, scrollable content area)
- [ ] Theme previews are visible at a readable size (not shrunk or cut off)
