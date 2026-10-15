/**
 * Admin dashboard formatters.
 *
 * formatStat is what fixed the "NaNM" money cards: formatted rupee strings were
 * passed to compact(), which assumes a number. It also turns "unavailable"
 * (null) into "—" instead of a zero that looks like real data.
 */
import { describe, test, expect, vi, afterEach } from "vitest";
import { formatStat, formatDate, daysUntil } from "../utils";

afterEach(() => { vi.useRealTimers(); });

describe("formatStat", () => {
  test.each([
    [0, "0"],
    [999, "999"],
    [12500, "12.5k"],
    ["4200000", "4.2M"],      // BIGINT counts arrive as strings
    ["₹1,200", "₹1,200"],     // already-formatted money passes through
    [null, "—"],
    [undefined, "—"],
    ["", "—"],
    [NaN, "—"],
    [{}, "—"],
  ])("%p → %p", (input, expected) => {
    expect(formatStat(input)).toBe(expected);
  });
});

describe("formatDate / daysUntil", () => {
  test("format a date; nothing or junk is a dash", () => {
    expect(formatDate("2026-10-15T10:00:00.000Z", "en-GB")).toBe("15 Oct 2026");
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not a date")).toBe("—");
  });

  test("days until a future date; never negative", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T00:00:00.000Z"));
    expect(daysUntil("2026-11-14T00:00:00.000Z")).toBe(30);
    expect(daysUntil("2026-10-15T12:00:00.000Z")).toBe(1);
    expect(daysUntil("2026-10-01T00:00:00.000Z")).toBe(0);
    expect(daysUntil(undefined)).toBeNull();
  });
});
