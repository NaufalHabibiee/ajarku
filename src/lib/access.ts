import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/auth";
import type { User } from "@prisma/client";

/**
 * Whether a user may watch a given lesson.
 * Free lessons are open to any logged-in user; paid lessons require an active
 * (non-expired) subscription.
 */
export function canAccessLesson(
  user: Pick<User, "isSubscribed" | "subscriptionExpiry" | "role">,
  lesson: { isFree: boolean }
): boolean {
  if (lesson.isFree) return true;
  if (user.role === "admin" || user.role === "superadmin") return true;
  return hasActiveSubscription(user);
}

/**
 * Fetch a lesson scoped to a tenant, with its module/course and the given
 * user's progress. Returns null if the lesson doesn't belong to the tenant.
 */
export async function getLessonForUser(
  lessonId: string,
  tenantId: string,
  userId: string
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { include: { course: true } },
      progress: { where: { userId } },
    },
  });
  if (!lesson || lesson.module.course.tenantId !== tenantId) return null;
  return lesson;
}
