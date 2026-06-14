import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessLesson, getLessonForUser } from "@/lib/access";
import { ensureCertificate } from "@/lib/certificate";
import { updateStreakOnActivity } from "@/lib/streak";
import { evaluateBadges } from "@/lib/badges";
import { createNotification } from "@/lib/notifications";

const bodySchema = z.object({
  lessonId: z.string().min(1),
  watchedSeconds: z.number().int().nonnegative(),
  // Client signals completion when the video crosses 90% watched.
  completed: z.boolean().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const lesson = await getLessonForUser(
    parsed.lessonId,
    user.tenantId,
    user.id
  );
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }
  if (!canAccessLesson(user, lesson)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = lesson.progress[0];
  // Never move watched time backwards (e.g. user scrubs back then closes).
  const watchedSeconds = Math.max(
    parsed.watchedSeconds,
    existing?.watchedSeconds ?? 0
  );
  const completedAt =
    parsed.completed || existing?.completedAt
      ? existing?.completedAt ?? new Date()
      : null;

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    update: { watchedSeconds, completedAt },
    create: {
      userId: user.id,
      lessonId: lesson.id,
      watchedSeconds,
      completedAt,
    },
  });

  // Any learning activity counts toward the daily streak (idempotent per WIB day).
  if (watchedSeconds > 0) {
    const streak = await updateStreakOnActivity(user.id);
    if (streak?.reachedMilestone) {
      await createNotification({
        tenantId: user.tenantId,
        userId: user.id,
        type: "achievement",
        title: `Streak ${streak.reachedMilestone} hari! 🔥`,
        body: `Luar biasa! Kamu sudah belajar ${streak.reachedMilestone} hari berturut-turut.`,
        refId: `streak-milestone-${streak.reachedMilestone}`,
        link: "/dashboard",
      });
    }
  }

  // When a lesson is newly completed, check course completion (certificate) and
  // re-evaluate achievement badges.
  let certificateCode: string | null = null;
  if (completedAt) {
    const cert = await ensureCertificate(user.id, user.tenantId);
    certificateCode = cert?.verificationCode ?? null;
    await evaluateBadges(user.id, user.tenantId);
  }

  return NextResponse.json({
    ok: true,
    completed: Boolean(completedAt),
    certificateCode,
  });
}
