import { describe, it, expect } from "vitest";
import { formatIDR, formatDuration } from "./format";

describe("formatIDR", () => {
  it("formats an integer as Indonesian Rupiah", () => {
    const out = formatIDR(99000);
    expect(out).toContain("Rp");
    expect(out).toContain("99");
    // id-ID uses '.' as the thousands separator
    expect(out).toMatch(/99\.000/);
  });

  it("formats zero", () => {
    expect(formatIDR(0)).toMatch(/Rp\s?0/);
  });

  it("has no fraction digits", () => {
    expect(formatIDR(99000)).not.toContain(",00");
  });
});

describe("formatDuration", () => {
  it("formats seconds under an hour as m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(600)).toBe("10:00");
  });

  it("formats durations over an hour as h:mm:ss", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(3600)).toBe("1:00:00");
  });

  it("handles null/undefined/negative", () => {
    expect(formatDuration(null)).toBe("0:00");
    expect(formatDuration(undefined)).toBe("0:00");
    expect(formatDuration(-10)).toBe("0:00");
  });
});
