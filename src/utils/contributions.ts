import type { ContributionDay } from "@/hook/useLiveStats.ts";

export interface ContributionSummary {
  current: number;
  longest: number;
  activeDays: number;
  best: ContributionDay | null;
}

export function summarize(days: ContributionDay[], today = new Date().toISOString().slice(0, 10)): ContributionSummary {
  const past = days.filter((day) => day.date <= today);
  let longest = 0;
  let run = 0;
  let best: ContributionDay | null = null;
  for (const day of past) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
    if (day.count > 0 && (!best || day.count > best.count)) best = day;
  }

  let current = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].count > 0) current++;
    else if (i === past.length - 1 && past[i].date === today) continue;
    else break;
  }

  return { current, longest, activeDays: past.filter((day) => day.count > 0).length, best };
}

export function toWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (!days.length) return [];
  const weeks: (ContributionDay | null)[][] = [];
  const offset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  let week: (ContributionDay | null)[] = Array.from({ length: offset }, () => null);
  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array.from({ length: 7 - week.length }, () => null)]);
  return weeks;
}
