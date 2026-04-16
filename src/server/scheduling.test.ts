import { describe, expect, it } from "vitest";
import {
  dayOfWeekForDateInTimezone,
  generateSlotsForRange,
  isValidTimeRange,
} from "./scheduling";

describe("scheduling", () => {
  it("validates time ranges", () => {
    expect(isValidTimeRange("09:00", "17:00")).toBe(true);
    expect(isValidTimeRange("17:00", "09:00")).toBe(false);
  });

  it("generates slots for duration", () => {
    expect(generateSlotsForRange("09:00", "10:00", 30)).toEqual([
      "09:00",
      "09:30",
    ]);
    expect(generateSlotsForRange("09:00", "11:00", 30)).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
    ]);
  });

  it("resolves weekday in timezone for a calendar date", () => {
    const monday = dayOfWeekForDateInTimezone("2026-04-13", "UTC");
    expect(monday).toBe(1);
    const sunday = dayOfWeekForDateInTimezone("2026-04-12", "America/New_York");
    expect(sunday).toBe(0);
  });
});
