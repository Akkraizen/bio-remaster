import { describe, expect, it } from "vitest";
import { summarize, toWeeks } from "@/utils/contributions.ts";

const day = (date: string, count: number) => ({ date, count, level: count ? 1 : 0 });

describe("summarize", () => {
  const days = [
    day("2026-11-10", 2),
    day("2026-11-11", 3),
    day("2026-11-12", 1),
    day("2026-11-13", 0),
    day("2026-11-14", 5),
    day("2026-11-15", 1),
    day("2026-11-16", 0),
    day("2026-11-17", 0)
  ];

  it("counts streaks, active days and the best day", () => {
    expect(summarize(days, "2026-11-15")).toEqual({ current: 2, longest: 3, activeDays: 5, best: days[4] });
  });

  it("does not break the current streak on an empty today", () => {
    expect(summarize(days.slice(0, 7), "2026-11-16").current).toBe(2);
    expect(summarize(days, "2026-11-17").current).toBe(0);
  });
});

describe("toWeeks", () => {
  it("aligns the first day to its weekday and pads the last week", () => {
    const weeks = toWeeks([day("2026-11-11", 1), day("2026-11-12", 0)]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0][3]?.date).toBe("2026-11-11");
    expect(weeks[0]).toHaveLength(7);
  });
});
