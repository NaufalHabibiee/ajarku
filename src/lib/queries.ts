import { prisma } from "@/lib/prisma";

/** The published course for a tenant, with ordered modules and lessons. */
export async function getTenantCourse(tenantId: string) {
  return prisma.course.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

export type TenantCourse = NonNullable<
  Awaited<ReturnType<typeof getTenantCourse>>
>;

/** Aggregate lesson/duration counts for a course. */
export function courseStats(course: TenantCourse) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const totalSeconds = lessons.reduce(
    (sum, l) => sum + (l.videoDuration ?? 0),
    0
  );
  return {
    moduleCount: course.modules.length,
    lessonCount: lessons.length,
    freeLessonCount: lessons.filter((l) => l.isFree).length,
    totalSeconds,
  };
}
