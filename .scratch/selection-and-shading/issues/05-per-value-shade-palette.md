# 05: Per-value palette for the shade

**What to build:** The shade color is no longer a single accent: it is keyed to the value of the number in the selected filled cell. A palette of nine attractive colors — one per number 1–9, each with a dark variant (selected cell) and a light variant (other instances) — is defined in the 03 style module. Selecting a different number re-hues the whole board. The palette must not conflict with the other colors in the app: the blue selection/highlight fills, the red mistake color, and the zinc neutrals.

**Blocked by:** 04 (Shade the same-number cells)

**Status:** done

- [x] Selecting a filled cell shades its same-number instances in that value's palette color; switching the selection to another number switches the shade's hue across the board.
- [x] The selected cell always shows the dark variant of its value's color; the other instances show the light variant, with the same precedence rules as ticket 04 (shade over row/column/box fill; selected-cell shade over the blue selection fill).
- [x] All nine palette colors are mutually distinguishable at their light variants, and each is clearly distinct from the app's blue selection/highlight fills, red mistake color, and zinc neutrals. Palette: 1 rose, 2 orange, 3 amber, 4 yellow, 5 lime, 6 emerald, 7 teal, 8 cyan, 9 violet.
- [x] Digits stay legible in every palette color, on both variants (text color per value, dark and light).
- [x] A mistaken cell of the same number keeps its red text over the shade; same-number note instances keep their bold, unchanged; cell selection mode suppresses the shade, unchanged.
- [x] The palette lives in one place (the 03 style module) so it can be tuned in a single edit, and is documented in this feature's spec.
- [x] The switch stays code-level — no UI control is added.

## Comments

- 2026-10-08: Implemented on `selection-and-shading`. `sameNumberStyle.ts` now carries a `PALETTE` array (9 entries, keyed 1–9) with `[darkBg, darkText]` and `[lightBg, lightText]` per entry. The shade branch looks up `PALETTE[value - 1]` and returns the dark variant when `isSelected` is true, light otherwise. Updated tests: the 2 existing shade tests now expect lime (value 5), plus 3 new per-value palette tests verify different values get different colors and all 18 entries are unique. Full suite 140 passing, tsc + lint clean."
