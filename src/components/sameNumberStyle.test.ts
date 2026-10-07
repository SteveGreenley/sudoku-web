import { describe, expect, it } from "vitest";
import { sameNumberAppearance, sameNumberStyle } from "./sameNumberStyle";

// Pins the swappable same-number appearance: in bold mode the module must
// reproduce exactly the classes Cell derived inline; in shade mode it assigns
// the single accent color's dark/light variants (ticket 04).

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
  it("fills the selected same-number cell with the dark variant and dark text", () => {
    expect(sameNumberStyle(5, true, true, false, "shade")).toEqual({
      background: "bg-amber-300",
      text: "font-black",
      textColor: "text-amber-900",
      noteEmphasis: null,
    });
  });

  it("fills every other same-number instance (givens and placed alike) with the light variant and light text", () => {
    expect(sameNumberStyle(5, false, true, false, "shade")).toEqual({
      background: "bg-amber-100",
      text: "font-black",
      textColor: "text-amber-700",
      noteEmphasis: null,
    });
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
