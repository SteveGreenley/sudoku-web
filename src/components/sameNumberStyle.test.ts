import { describe, expect, it } from "vitest";
import { sameNumberAppearance, sameNumberStyle } from "./sameNumberStyle";

// Pins the swappable same-number appearance to today's rendering: in bold
// mode the module must reproduce exactly the classes Cell derived inline.

describe("sameNumberAppearance", () => {
  it("defaults to bold (today's behavior)", () => {
    expect(sameNumberAppearance).toBe("bold");
  });

  it("falls back to bold when the switch is omitted", () => {
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
        sameNumberStyle(value, isSelected, isSameNumber, isSameNoteNumber, "bold"),
      );
    }
  });
});

describe("sameNumberStyle (bold)", () => {
  it("renders a same-number placed cell bold, with no background override", () => {
    expect(sameNumberStyle(5, false, true, false, "bold")).toEqual({
      background: null,
      text: "font-black",
      noteEmphasis: null,
    });
  });

  it("renders the selected cell bold too, leaving its blue-300 fill in the cell", () => {
    expect(sameNumberStyle(5, true, true, false, "bold")).toEqual({
      background: null,
      text: "font-black",
      noteEmphasis: null,
    });
  });

  it("leaves a non-same-number cell to the cell's given/default weight and fill", () => {
    expect(sameNumberStyle(3, false, false, false, "bold")).toEqual({
      background: null,
      text: null,
      noteEmphasis: null,
    });
  });

  it("emphasizes a matching note digit bold, with no background override", () => {
    expect(sameNumberStyle(0, false, false, true, "bold")).toEqual({
      background: null,
      text: null,
      noteEmphasis: "font-black",
    });
  });

  it("suppresses everything when the board reports no same-number set (cell selection mode)", () => {
    // Board passes all highlight flags false while in cell selection.
    expect(sameNumberStyle(0, true, false, false, "bold")).toEqual({
      background: null,
      text: null,
      noteEmphasis: null,
    });
  });
});

describe("sameNumberStyle (shade, placeholder for tickets 04/05)", () => {
  it("renders exactly like bold until the shade variants land", () => {
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
        sameNumberStyle(value, isSelected, isSameNumber, isSameNoteNumber, "shade"),
      ).toEqual(
        sameNumberStyle(value, isSelected, isSameNumber, isSameNoteNumber, "bold"),
      );
    }
  });
});
