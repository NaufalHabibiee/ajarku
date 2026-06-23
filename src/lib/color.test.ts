import { describe, it, expect } from "vitest";
import { hexToHslString, readableForeground } from "./color";

describe("hexToHslString", () => {
  it("converts a 6-digit hex to an HSL triplet", () => {
    expect(hexToHslString("#ffffff")).toBe("0 0% 100%");
    expect(hexToHslString("#000000")).toBe("0 0% 0%");
  });

  it("expands 3-digit shorthand", () => {
    expect(hexToHslString("#fff")).toBe("0 0% 100%");
  });

  it("handles the AjarKu teal", () => {
    // #14B8A6 -> roughly 173 80% 40%
    const hsl = hexToHslString("#14B8A6");
    expect(hsl).toMatch(/^17[0-5] \d{1,3}% \d{1,3}%$/);
  });

  it("returns null for invalid input", () => {
    expect(hexToHslString("not-a-color")).toBeNull();
    expect(hexToHslString("")).toBeNull();
    expect(hexToHslString(null)).toBeNull();
    expect(hexToHslString(undefined)).toBeNull();
  });
});

describe("readableForeground", () => {
  it("returns dark text on light backgrounds", () => {
    expect(readableForeground("#ffffff")).toBe("0 0% 9%");
  });

  it("returns light text on dark backgrounds", () => {
    expect(readableForeground("#000000")).toBe("0 0% 100%");
    expect(readableForeground("#14B8A6")).toBe("0 0% 100%");
  });

  it("falls back to white for invalid input", () => {
    expect(readableForeground(null)).toBe("0 0% 100%");
  });
});
