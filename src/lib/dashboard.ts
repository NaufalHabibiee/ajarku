import { prisma } from "@/lib/prisma";
import {
  wibDayKey,
  wibWeekDayKeys,
  wibYearMonth,
  WEEKDAY_LABELS_ID,
  MONTH_LABELS_ID,
} from "@/lib/time";

export type WeeklyStats = {
  minutesThisWeek: number;
  lessonsThisWeek: number;
  daysActiveThisWeek: number;
  deltaLessons: number; // vs last week
  bars: { label: string; minutes: number }[]; // Mon..Sun
};

/**
 * Weekly learning activity derived from completed lessons (Progress.completedAt)
 * and each lesson's videoDuration. Days are bucketed in WIB.
 */
export async function getWeeklyStats(userId: string): Promise<WeeklyStats> {
  const now = new Date();
  const thisWeekKeys = wibWeekDayKeys(now);
  const lastWeekKeys = wibWeekDayKeys(now.getTime() - 7 * 86_400_000);
  const thisWeekSet = new Set(thisWeekKeys);
  const lastWeekSet = new Set(lastWeekKeys);

  // Fetch ~3 weeks of completions to cover both weeks regardless of boundary.
  const since = new Date(now.getTime() - 21 * 86_400_000);
  const completed = await prisma.progress.findMany({
    where: { userId, completedAt: { gte: since, not: null } },
    select: { completedAt: true, lesson: { select: { videoDuration: true } } },
  });

  const minutesByKey = new Map<string, number>();
  let lessonsThisWeek = 0;
  let lessonsLastWeek = 0;

  for (const p of completed) {
    if (!p.completedAt) continue;
    const key = wibDayKey(p.completedAt);
    const minutes = Math.round((p.lesson.videoDuration ?? 0) / 60);
    if (thisWeekSet.has(key)) {
      minutesByKey.set(key, (minutesByKey.get(key) ?? 0) + minutes);
      lessonsThisWeek += 1;
    } else if (lastWeekSet.has(key)) {
      lessonsLastWeek += 1;
    }
  }

  const bars = thisWeekKeys.map((key, i) => ({
    label: WEEKDAY_LABELS_ID[i],
    minutes: minutesByKey.get(key) ?? 0,
  }));

  return {
    minutesThisWeek: bars.reduce((s, b) => s + b.minutes, 0),
    lessonsThisWeek,
    daysActiveThisWeek: thisWeekKeys.filter((k) => (minutesByKey.get(k) ?? 0) > 0).length,
    deltaLessons: lessonsThisWeek - lessonsLastWeek,
    bars,
  };
}

/** Minutes learned per month for the current year (Jan–Dec), bucketed in WIB. */
export async function getMonthlyStats(
  userId: string
): Promise<{ label: string; minutes: number }[]> {
  const now = new Date();
  const { year } = wibYearMonth(now);
  const start = new Date(`${year}-01-01T00:00:00Z`);

  const completed = await prisma.progress.findMany({
    where: { userId, completedAt: { gte: start, not: null } },
    select: { completedAt: true, lesson: { select: { videoDuration: true } } },
  });

  const minutes = new Array(12).fill(0);
  for (const p of completed) {
    if (!p.completedAt) continue;
    const ym = wibYearMonth(p.completedAt);
    if (ym.year === year) {
      minutes[ym.month] += Math.round((p.lesson.videoDuration ?? 0) / 60);
    }
  }
  return MONTH_LABELS_ID.map((label, i) => ({ label, minutes: minutes[i] }));
}
