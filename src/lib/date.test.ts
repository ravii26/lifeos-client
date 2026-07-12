import { describe, expect, it, vi, afterEach } from "vitest";
import {
  localDayKey,
  safeDate,
  formatShortDate,
  formatDate,
  formatLongDate,
  formatWeekdayShort,
  timeAgo,
} from "./date";

describe("localDayKey", () => {
  it("formats using local (not UTC) components", () => {
    expect(localDayKey(new Date(2026, 6, 9))).toBe("2026-07-09");
  });

  it("pads single-digit month and day", () => {
    expect(localDayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("safeDate", () => {
  it("returns null for undefined input", () => {
    expect(safeDate(undefined)).toBeNull();
  });

  it("returns null for an invalid date string", () => {
    expect(safeDate("not-a-date")).toBeNull();
  });

  it("returns a Date for a valid ISO string", () => {
    const d = safeDate("2026-07-09T00:00:00.000Z");
    expect(d).toBeInstanceOf(Date);
  });
});

describe("formatShortDate", () => {
  it("formats month and day without a year", () => {
    expect(formatShortDate(new Date(2026, 6, 9))).toBe("Jul 9");
  });
});

describe("formatDate", () => {
  it("formats month, day, and year", () => {
    expect(formatDate(new Date(2026, 6, 9))).toBe("Jul 9, 2026");
  });
});

describe("formatLongDate", () => {
  it("includes the full weekday name", () => {
    expect(formatLongDate(new Date(2026, 6, 9))).toBe("Thursday, Jul 9");
  });
});

describe("formatWeekdayShort", () => {
  it("formats the abbreviated weekday", () => {
    expect(formatWeekdayShort(new Date(2026, 6, 9))).toBe("Thu");
  });
});

describe("timeAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for missing input", () => {
    expect(timeAgo(undefined)).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(timeAgo("not-a-date")).toBeNull();
  });

  it('returns "now" for the current instant', () => {
    const now = new Date(2026, 6, 9, 12, 0, 0);
    vi.useFakeTimers().setSystemTime(now);
    expect(timeAgo(now.toISOString())).toBe("now");
  });

  it("formats seconds ago", () => {
    const now = new Date(2026, 6, 9, 12, 0, 0);
    vi.useFakeTimers().setSystemTime(now);
    expect(timeAgo(new Date(2026, 6, 9, 11, 59, 45).toISOString())).toBe("15s ago");
  });

  it("formats minutes ago", () => {
    const now = new Date(2026, 6, 9, 12, 0, 0);
    vi.useFakeTimers().setSystemTime(now);
    expect(timeAgo(new Date(2026, 6, 9, 11, 55, 0).toISOString())).toBe("5m ago");
  });

  it("formats days ago", () => {
    const now = new Date(2026, 6, 9, 12, 0, 0);
    vi.useFakeTimers().setSystemTime(now);
    expect(timeAgo(new Date(2026, 6, 7, 12, 0, 0).toISOString())).toBe("2d ago");
  });
});
