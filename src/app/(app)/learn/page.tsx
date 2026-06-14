import Link from "next/link";
import { Award, CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { CertificateActions } from "@/components/certificate-actions";
import { prisma } from "@/lib/prisma";
import { canAccessLesson } from "@/lib/access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Course" };

export default async function LearnPage() {
  const user = await requireUser();

  const course = await prisma.course.findFirst({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          No course has been published yet. Check back soon.
        </p>
      </div>
    );
  }

  const lessons = course.modules.flatMap((m) => m.lessons);
  const completed = await prisma.progress.findMany({
    where: {
      userId: user.id,
      completedAt: { not: null },
      lessonId: { in: lessons.map((l) => l.id) },
    },
    select: { lessonId: true },
  });
  const completedSet = new Set(completed.map((p) => p.lessonId));
  const pct =
    lessons.length > 0
      ? Math.round((completedSet.size / lessons.length) * 100)
      : 0;

  // First incomplete accessible lesson, for "continue".
  const continueLesson =
    lessons.find((l) => !completedSet.has(l.id) && canAccessLesson(user, l)) ??
    lessons.find((l) => canAccessLesson(user, l));

  const certificate = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground">
            {pct}%
          </span>
        </div>
        {continueLesson && (
          <Button asChild variant="brand">
            <Link href={`/learn/${continueLesson.id}`}>
              <PlayCircle className="mr-2 h-4 w-4" />
              {completedSet.size > 0 ? "Continue learning" : "Start course"}
            </Link>
          </Button>
        )}
      </div>

      {certificate && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-brand/40 bg-brand/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-brand" />
            <div>
              <p className="font-semibold">Course completed — certificate earned!</p>
              <p className="text-sm text-muted-foreground">
                Verification code: {certificate.verificationCode}
              </p>
            </div>
          </div>
          <CertificateActions code={certificate.verificationCode} />
        </div>
      )}

      <div className="space-y-6">
        {course.modules.map((module, mi) => (
          <section key={module.id}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Module {mi + 1}</span>
              <span className="text-foreground">· {module.title}</span>
            </h2>
            <ul className="divide-y rounded-lg border">
              {module.lessons.map((lesson) => {
                const access = canAccessLesson(user, lesson);
                const done = completedSet.has(lesson.id);
                const inner = (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm",
                      access ? "hover:bg-muted" : "opacity-60"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : access ? (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.isFree && (
                      <Badge variant="outline" className="text-[10px]">
                        Free
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(lesson.videoDuration)}
                    </span>
                  </div>
                );
                return (
                  <li key={lesson.id}>
                    {access ? (
                      <Link href={`/learn/${lesson.id}`} className="block">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
