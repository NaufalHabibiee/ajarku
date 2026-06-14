import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/** Short, human-friendly, URL-safe verification code, e.g. "CERT-9F3K2A7Q". */
function generateVerificationCode(): string {
  const code = randomBytes(6)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 8)
    .padEnd(8, "0");
  return `CERT-${code}`;
}

/**
 * Determine whether a user has completed a course: every non-free lesson must
 * have a completed Progress record. (Free lessons are previews and don't gate
 * completion.) Returns the courseId if complete, else null.
 */
export async function checkCourseCompletion(
  userId: string,
  tenantId: string
): Promise<string | null> {
  const course = await prisma.course.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
    include: { modules: { include: { lessons: true } } },
  });
  if (!course) return null;

  const requiredLessonIds = course.modules
    .flatMap((m) => m.lessons)
    .filter((l) => !l.isFree)
    .map((l) => l.id);

  if (requiredLessonIds.length === 0) return null;

  const completed = await prisma.progress.count({
    where: {
      userId,
      completedAt: { not: null },
      lessonId: { in: requiredLessonIds },
    },
  });

  return completed >= requiredLessonIds.length ? course.id : null;
}

/**
 * Issue a certificate if the user has completed the course and doesn't have one
 * yet. Returns the certificate (existing or new), or null if not complete.
 */
export async function ensureCertificate(userId: string, tenantId: string) {
  const courseId = await checkCourseCompletion(userId, tenantId);
  if (!courseId) return null;

  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing;

  return prisma.certificate.create({
    data: { userId, courseId, verificationCode: generateVerificationCode() },
  });
}
