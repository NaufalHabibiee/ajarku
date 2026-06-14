import Link from "next/link";
import { ChevronRight, Camera, Wrench, FileSearch, Code } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessLesson } from "@/lib/access";
import { formatDuration } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ICONS = [Camera, Wrench, FileSearch, Code];
const TINTS = [
  "bg-ajar-indigo/10 text-ajar-indigo",
  "bg-ajar-teal/10 text-ajar-teal",
  "bg-amber-500/10 text-amber-500",
  "bg-rose-500/10 text-rose-500",
];

export async function CourseTaskCard() {
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
  const lessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const completed = await prisma.progress.findMany({
    where: { userId: user.id, completedAt: { not: null }, lessonId: { in: lessons.map((l) => l.id) } },
    select: { lessonId: true },
  });
  const done = new Set(completed.map((p) => p.lessonId));

  const tasks = lessons
    .filter((l) => !done.has(l.id) && canAccessLesson(user, l))
    .slice(0, 4);

  return (
    <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Course Task</CardTitle>
        <Link href="/learn" className="text-sm font-medium text-ajar-teal hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Semua tugas selesai! 🎉
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <li key={task.id}>
                  <Link
                    href={`/learn/${task.id}`}
                    className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TINTS[i % TINTS.length]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(task.videoDuration)} • belum selesai
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CourseTaskCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Course Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}
