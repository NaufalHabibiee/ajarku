import { prisma } from "@/lib/prisma";
import { wibDayKey } from "@/lib/time";
import type { User } from "@prisma/client";

export type NotificationType =
  | "announcement"
  | "forum_reply"
  | "live_soon"
  | "streak_risk"
  | "lesson_unlocked"
  | "achievement";

type CreateArgs = {
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  refId: string; // required for idempotency
  link?: string | null;
};

/** Create a notification idempotently (one per user+type+refId). */
export async function createNotification(args: CreateArgs) {
  return prisma.notification.upsert({
    where: {
      userId_type_refId: {
        userId: args.userId,
        type: args.type,
        refId: args.refId,
      },
    },
    update: {}, // never overwrite read state
    create: {
      tenantId: args.tenantId,
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      refId: args.refId,
      link: args.link ?? null,
    },
  });
}

export async function getNotifications(userId: string, limit = 10) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

/**
 * Generate notifications for the current user (lazy fan-out on dashboard load).
 * Idempotent — safe to call on every dashboard render.
 */
export async function syncNotifications(
  user: Pick<
    User,
    "id" | "tenantId" | "currentStreak" | "lastLearnedAt"
  >
): Promise<void> {
  const now = new Date();

  // Fetch all source rows in parallel.
  const [announcements, replies, soon] = await Promise.all([
    prisma.announcement.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.forumReply.findMany({
      where: {
        thread: { tenantId: user.tenantId, userId: user.id },
        userId: { not: user.id },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { thread: { select: { id: true, title: true } } },
    }),
    prisma.liveSession.findMany({
      where: {
        tenantId: user.tenantId,
        scheduledAt: { gt: now, lte: new Date(now.getTime() + 60 * 60 * 1000) },
      },
    }),
  ]);

  // Build all upserts, then run them concurrently (cuts round-trips on a
  // far-away DB from ~25 sequential to one parallel batch).
  const jobs: Promise<unknown>[] = [];

  for (const a of announcements) {
    jobs.push(
      createNotification({
        tenantId: user.tenantId,
        userId: user.id,
        type: "announcement",
        title: a.title,
        body: a.body,
        refId: a.id,
        link: "/dashboard#pengumuman",
      })
    );
  }
  for (const r of replies) {
    jobs.push(
      createNotification({
        tenantId: user.tenantId,
        userId: user.id,
        type: "forum_reply",
        title: "Balasan baru di diskusimu",
        body: `Ada balasan baru di "${r.thread.title}".`,
        refId: r.id,
        link: `/community/${r.thread.id}`,
      })
    );
  }
  if (user.currentStreak > 0) {
    const todayKey = wibDayKey(now);
    const lastKey = user.lastLearnedAt ? wibDayKey(user.lastLearnedAt) : null;
    if (lastKey !== todayKey) {
      jobs.push(
        createNotification({
          tenantId: user.tenantId,
          userId: user.id,
          type: "streak_risk",
          title: "Streak kamu dalam bahaya!",
          body: `Kamu belum belajar hari ini! Streak ${user.currentStreak} hari kamu akan hilang 😱`,
          refId: `streak-${todayKey}`,
          link: "/learn",
        })
      );
    }
  }
  for (const s of soon) {
    jobs.push(
      createNotification({
        tenantId: user.tenantId,
        userId: user.id,
        type: "live_soon",
        title: "Live session sebentar lagi!",
        body: `"${s.title}" akan dimulai dalam waktu kurang dari 1 jam.`,
        refId: s.id,
        link: "/live",
      })
    );
  }

  await Promise.all(jobs);
}
