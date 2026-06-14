import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export type BadgeDef = {
  key: string;
  emoji: string;
  title: string;
  description: string;
  howTo: string;
};

/** The full badge catalog, in display order. */
export const BADGE_CATALOG: BadgeDef[] = [
  {
    key: "pelajar_perdana",
    emoji: "🎓",
    title: "Pelajar Perdana",
    description: "Menyelesaikan pelajaran pertamamu.",
    howTo: "Selesaikan satu pelajaran apa pun.",
  },
  {
    key: "konsisten_7",
    emoji: "🔥",
    title: "Konsisten 7 Hari",
    description: "Belajar 7 hari berturut-turut.",
    howTo: "Pertahankan streak belajar selama 7 hari.",
  },
  {
    key: "aktif_forum",
    emoji: "💬",
    title: "Aktif di Forum",
    description: "Aktif berdiskusi di komunitas.",
    howTo: "Buat 3 thread atau balasan di forum.",
  },
  {
    key: "setengah_jalan",
    emoji: "⚡",
    title: "Setengah Jalan",
    description: "Menyelesaikan 50% materi kursus.",
    howTo: "Selesaikan separuh pelajaran berbayar.",
  },
  {
    key: "lulus",
    emoji: "🏆",
    title: "Lulus!",
    description: "Menyelesaikan seluruh kursus.",
    howTo: "Selesaikan 100% pelajaran berbayar.",
  },
  {
    key: "berlangganan",
    emoji: "💳",
    title: "Berlangganan",
    description: "Menjadi pelanggan berbayar.",
    howTo: "Aktifkan langganan bulanan.",
  },
];

const BADGE_MAP = new Map(BADGE_CATALOG.map((b) => [b.key, b]));

/**
 * Evaluate badge conditions for a user and award any newly earned badges.
 * Idempotent. Creates an achievement notification per new badge.
 * Returns the set of all earned badge keys.
 */
export async function evaluateBadges(
  userId: string,
  tenantId: string
): Promise<Set<string>> {
  const [user, course, completedAny, forumThreads, forumReplies, existing] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          currentStreak: true,
          longestStreak: true,
          isSubscribed: true,
          subscriptionExpiry: true,
        },
      }),
      prisma.course.findFirst({
        where: { tenantId },
        orderBy: { createdAt: "asc" },
        include: { modules: { include: { lessons: true } } },
      }),
      prisma.progress.count({
        where: { userId, completedAt: { not: null } },
      }),
      prisma.forumThread.count({ where: { userId } }),
      prisma.forumReply.count({ where: { userId } }),
      prisma.badge.findMany({ where: { userId }, select: { badgeKey: true } }),
    ]);

  const earned = new Set(existing.map((b) => b.badgeKey));
  if (!user) return earned;

  const paidSub = await prisma.subscription.count({
    where: { userId, status: "paid" },
  });
  const subscribed =
    paidSub > 0 ||
    (user.isSubscribed &&
      !!user.subscriptionExpiry &&
      user.subscriptionExpiry.getTime() > Date.now());

  const paidLessonIds =
    course?.modules.flatMap((m) => m.lessons).filter((l) => !l.isFree).map((l) => l.id) ??
    [];
  const completedPaid =
    paidLessonIds.length > 0
      ? await prisma.progress.count({
          where: {
            userId,
            completedAt: { not: null },
            lessonId: { in: paidLessonIds },
          },
        })
      : 0;
  const completionPct =
    paidLessonIds.length > 0 ? completedPaid / paidLessonIds.length : 0;

  const conditions: Record<string, boolean> = {
    pelajar_perdana: completedAny >= 1,
    konsisten_7: user.longestStreak >= 7 || user.currentStreak >= 7,
    aktif_forum: forumThreads + forumReplies >= 3,
    setengah_jalan: completionPct >= 0.5,
    lulus: paidLessonIds.length > 0 && completedPaid >= paidLessonIds.length,
    berlangganan: subscribed,
  };

  for (const [key, met] of Object.entries(conditions)) {
    if (met && !earned.has(key)) {
      await prisma.badge.create({ data: { userId, badgeKey: key } });
      earned.add(key);
      const def = BADGE_MAP.get(key);
      if (def) {
        await createNotification({
          tenantId,
          userId,
          type: "achievement",
          title: `Lencana baru: ${def.title}`,
          body: `Selamat! Kamu mendapatkan lencana "${def.title}" ${def.emoji}`,
          refId: key,
          link: "/dashboard#pencapaian",
        });
      }
    }
  }

  return earned;
}
