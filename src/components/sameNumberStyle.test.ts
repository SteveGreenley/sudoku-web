import { describe, expect, it } from "vitest";
import { sameNumberAppearance, sameNumberStyle } from "./sameNumberStyle";

// Pins the swappable same-number appearance: in bold mode the module must
// reproduce exactly the classes Cell derived inline; in shade mode it assigns
// the per-value palette (ticket 05).

describe("sameNumberAppearance", () => {
  it("defaults to shade (ticket 04 flips it from bold)", () => {
    expect(sameNumberAppearance).toBe("shade");
  });

  it("falls back to the default appearance when the switch is omitted", () => {
    for (const [value, isSelected, isSameNumber, isSameNoteNumber] of [
      [5, true, true, false],
      [5, false, true, false],
      [3, false, false, false],
      [0, false, false, true],
      [0, true, false, false],
    ] as [number, boolean, boolean, boolean][]) {
      expect(
        sameNumberStyle(value, isSelected, isSameNumber, isSameNoteNumber),
      ).toEqual(
        sameNumberStyle(
          value,
          isSelected,
          isSameNumber,
          isSameNoteNumber,
          sameNumberAppearance,
        ),
      );
    }
  });
});

describe("sameNumberStyle (bold)", () => {
  it("renders a same-number placed cell bold, with no background or text-color override", () => {
    expect(sameNumberStyle(5, false, true, false, "bold")).toEqual({
      background: null,
      text: "font-black",
      textColor: null,
      noteEmphasis: null,
    });
  });

  it("renders the selected cell bold too, leaving its blue-300 fill in the cell", () => {
    expect(sameNumberStyle(5, true, true, false, "bold")).toEqual({
      background: null,
      text: "font-black",
      textColor: null,
      noteEmphasis: null,
    });
  });

  it("leaves a non-same-number cell to the cell's given/default weight and fill", () => {
    expect(sameNumberStyle(3, false, false, false, "bold")).toEqual({
      background: null,
      text: null,
      textColor: null,
      noteEmphasis: null,
    });
  });

  it("emphasizes a matching note digit bold, with no background override", () => {
    expect(sameNumberStyle(0, false, false, true, "bold")).toEqual({
      background: null,
      text: null,
      textColor: null,
      noteEmphasis: "font-black",
    });
  });

  it("suppresses everything when the board reports no same-number set (cell selection mode)", () => {
    // Board passes all highlight flags false while in cell selection.
    expect(sameNumberStyle(0, true, false, false, "bold")).toEqual({
      background: null,
      text: null,
      textColor: null,
      noteEmphasis: null,
    });
  });

  it("keeps the text-color slot null for every cell in bold mode", () => {
    const cases: [number, boolean, boolean, boolean][] = [
      [5, true, true, false], // the selected filled cell
      [5, false, true, false], // another instance
      [3, false, false, false], // an unrelated filled cell
      [0, false, false, true], // an empty cell with a matching note
      [0, true, false, false], // a filled-looking cell in cell selection
      [0, false, false, false], // an empty cell
    ];
    for (const [value, isSelected, isSameNumber, isSameNoteNumber] of cases) {
      expect(
        sameNumberStyle(value, isSelected, isSameNumber, isSameNoteNumber, "bold").textColor,
      ).toBeNull();
    }
  });
});

describe("sameNumberStyle (shade)", () => {
  it("fills the selected same-number cell with the dark variant and dark text (value 5 = lime)", () => {
    expect(sameNumberStyle(5, true, true, false, "shade")).toEqual({
      background: "bg-lime-300",
      text: "font-black",
      textColor: "text-lime-900",
      noteEmphasis: null,
    });
  });

  it("fills every other same-number instance (givens and placed alike) with the light variant and light text (value 5 = lime)", () => {
    expect(sameNumberStyle(5, false, true, false, "shade")).toEqual({
      background: "bg-lime-100",
      text: "font-black",
      textColor: "text-lime-700",
      noteEmphasis: null,
    });
  });

  it("applies a different palette color per value (per-value shade, ticket 05)", () => {
    const selected = sameNumberStyle(1, true, true, false, "shade");
    const selectedNine = sameNumberStyle(9, true, true, false, "shade");
    expect(selected.background).toBe("bg-rose-300");
    expect(selectedNine.background).toBe("bg-violet-300");
    expect(selected.background).not.toBe(selectedNine.background);
  });

  it("uses the light variant for non-selected same-number cells, keyed by value", () => {
    const light1 = sameNumberStyle(1, false, true, false, "shade");
    const light4 = sameNumberStyle(4, false, true, false, "shade");
    const light9 = sameNumberStyle(9, false, true, false, "shade");
    expect(light1.background).toBe("bg-rose-100");
    expect(light4.background).toBe("bg-yellow-100");
    expect(light9.background).toBe("bg-violet-100");
  });

  it("every palette entry 1–9 provides distinct dark and light background colors", () => {
    const bgColors = Array.from({ length: 9 }, (_, i) => i + 1).map(
      (v) => sameNumberStyle(v, true, true, false, "shade").background,
    );
    const lightBgColors = Array.from({ length: 9 }, (_, i) => i + 1).map(
      (v) => sameNumberStyle(v, false, true, false, "shade").background,
    );
    // All 9 dark colors are unique
    expect(new Set(bgColors).size).toBe(9);
    // All 9 light colors are unique
    expect(new Set(lightBgColors).size).toBe(9);
    // No dark color equals any light color
    for (const dark of bgColors) {
      expect(lightBgColors).not.toContain(dark);
    }
  });

  it("leaves a non-same-number cell to the cell's own cascade: no background, no text color", () => {
    expect(sameNumberStyle(3, false, false, false, "shade")).toEqual({
      background: null,
      text: null,
      textColor: null,
      noteEmphasis: null,
    });
  });

  it("shades a selected cell only when it is in the same-number set (an empty selected cell gets none)", () => {
    expect(sameNumberStyle(0, true, false, false, "shade")).toEqual({
      background: null,
      text: null,
      textColor: null,
      noteEmphasis: null,
    });
  });

  it("keeps a same-number note digit bold but never shades a notes-only cell", () => {
    expect(sameNumberStyle(0, false, false, true, "shade")).toEqual({
      background: null,
      text: null,
      textColor: null,
      noteEmphasis: "font-black",
    });
  });

  it("suppresses everything when the board reports no same-number set (cell selection mode)", () => {
    // Board passes all highlight flags false while in cell selection.
    expect(sameNumberStyle(0, true, false, false, "shade")).toEqual({
      background: null,
      text: null,
      textColor: null,
      noteEmphasis: null,
    });
  });

  it("keeps the note emphasis slot as font-black in shade mode, matching bold", () => {
    for (const isSameNoteNumber of [true, false]) {
      const shade = sameNumberStyle(0, false, false, isSameNoteNumber, "shade");
      const bold = sameNumberStyle(0, false, false, isSameNoteNumber, "bold");
      expect(shade.noteEmphasis).toBe(
        isSameNoteNumber ? "font-black" : null,
      );
      expect(shade.noteEmphasis).toBe(bold.noteEmphasis);
    }
  });
});
