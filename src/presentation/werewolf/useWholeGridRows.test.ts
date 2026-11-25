import { describe, expect, it } from "vitest";
import { wholeRowsHeight } from "./useWholeGridRows";

describe("the height of a list in whole rows", () => {
  it("keeps as many whole rows as fit into the room, with their gaps and the padding", () => {
    // Rows of 50 with a gap of 6 and a padding of 8: four rows need 8 + 4 * 56 - 6 = 226.
    expect(wholeRowsHeight({ room: 250, row: 50, gap: 6, padding: 8 })).toBe(226);
    expect(wholeRowsHeight({ room: 226, row: 50, gap: 6, padding: 8 })).toBe(226);
    expect(wholeRowsHeight({ room: 225, row: 50, gap: 6, padding: 8 })).toBe(170);
  });

  it("shows at least one row in a very small room", () => {
    expect(wholeRowsHeight({ room: 20, row: 50, gap: 6, padding: 8 })).toBe(58);
  });
});
