import { describe, it, expect } from "vitest";
import {
  wibDayKey,
  wibWeekdayIndex,
  relativeTimeID,
  googleCalendarLink,
  wibYearMonth,
} from "./time";

describe("wibDayKey", () => {
  it("shifts UTC into WIB (+7) for the day boundary", () => {
    // 2026-06-14 20:00 UTC -> 2026-06-15 03:00 WIB
    expect(wibDayKey(new Date("2026-06-14T20:00:00Z"))).toBe("2026-06-15");
    // 2026-06-14 10:00 UTC -> 2026-06-14 17:00 WIB
    expect(wibDayKey(new Date("2026-06-14T10:00:00Z"))).toBe("2026-06-14");
  });
});

describe("wibWeekdayIndex", () => {
  it("returns 0 for Monday and 6 for Sunday (WIB)", () => {
    // 2026-06-15 is a Monday
    expect(wibWeekdayIndex(new Date("2026-06-15T05:00:00Z"))).toBe(0);
    // 2026-06-21 is a Sunday
    expect(wibWeekdayIndex(new Date("2026-06-21T05:00:00Z"))).toBe(6);
  });
});

describe("wibYearMonth", () => {
  it("returns 0-based month in WIB", () => {
    expect(wibYearMonth(new Date("2026-01-15T05:00:00Z"))).toEqual({
      year: 2026,
      month: 0,
    });
    expect(wibYearMonth(new Date("2026-12-31T20:00:00Z"))).toEqual({
      year: 2027,
      month: 0,
    });
  });
});

describe("relativeTimeID", () => {
  it("says 'Baru saja' for very recent times", () => {
    expect(relativeTimeID(new Date())).toBe("Baru saja");
  });

  it("formats minutes/hours/days in Indonesian", () => {
    const now = Date.now();
    expect(relativeTimeID(new Date(now - 5 * 60_000))).toBe("5 menit lalu");
    expect(relativeTimeID(new Date(now - 3 * 3_600_000))).toBe("3 jam lalu");
    expect(relativeTimeID(new Date(now - 2 * 86_400_000))).toBe("2 hari lalu");
  });
});

describe("googleCalendarLink", () => {
  it("builds a TEMPLATE link with encoded dates", () => {
    const url = googleCalendarLink({
      title: "Live QnA",
      start: new Date("2026-06-15T12:00:00Z"),
    });
    expect(url).toContain("calendar.google.com");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("Live+QnA");
    expect(url).toContain("20260615T120000Z");
  });
});
