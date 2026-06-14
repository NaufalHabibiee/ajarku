import { prisma } from "@/lib/prisma";
import { wibDayKey } from "@/lib/time";
import type { User } from "@prisma/client";

export const STREAK_MILESTONES = [
  { days: 7, emoji: "🔥", label: "7 hari" },
  { days: 30, emoji: "💎", label: "30 hari" },
  { days: 100, emoji: "👑", label: "100 hari" },
] as const;

/** Whether the user has had learning activity today (WIB). */
export function hasLearnedToday(
  user: Pick<User, "lastLearnedAt">
): boolean {
  if (!user.lastLearnedAt) return false;
  return wibDayKey(user.lastLearnedAt) === wibDayKey(new Date());
}

/**
 * Record learning activity and update the streak. Called when a lesson is
 * completed. Day boundaries are WIB. Idempotent within the same WIB day.
 */
export async function updateStreakOnActivity(
  userId: string
): Promise<{ currentStreak: number; longestStreak: number; reachedMilestone: number | null } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastLearnedAt: true },
  });
  if (!user) return null;

  const now = new Date();
  const todayKey = wibDayKey(now);
  const lastKey = user.lastLearnedAt ? wibDayKey(user.lastLearnedAt) : null;

  // Already counted today — just refresh the timestamp, no streak change.
  if (lastKey === todayKey) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      reachedMilestone: null,
    };
  }

  const yesterdayKey = wibDayKey(now.getTime() - 86_400_000);
  const currentStreak = lastKey === yesterdayKey ? user.currentStreak + 1 : 1;
  const longestStreak = Math.max(currentStreak, user.longestStreak);

  await prisma.user.update({
    where: { id: userId },
    data: { currentStreak, longestStreak, lastLearnedAt: now },
  });

  const reachedMilestone =
    STREAK_MILESTONES.find((m) => m.days === currentStreak)?.days ?? null;

  return { currentStreak, longestStreak, reachedMilestone };
}
