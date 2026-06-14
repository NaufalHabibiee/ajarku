import Link from "next/link";
import { BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function YourCoursesCard() {
  const user = await requireUser();

  const course = await prisma.course.findFirst({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, select: { id: true } } },
      },
    },
  });
  const modules = course?.modules ?? [];
  const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));

  const completed = await prisma.progress.findMany({
    where: { userId: user.id, completedAt: { not: null }, lessonId: { in: allLessonIds } },
    select: { lessonId: true },
  });
  const done = new Set(completed.map((p) => p.lessonId));

  const cards = modules.map((m) => {
    const total = m.lessons.length;
    const doneCount = m.lessons.filter((l) => done.has(l.id)).length;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    const firstLesson = m.lessons[0]?.id;
    return { id: m.id, title: m.title, total, pct, firstLesson };
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Your Courses</CardTitle>
        <Link href="/learn" className="text-sm font-medium text-ajar-teal hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {cards.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada modul.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link
                key={c.id}
                href={c.firstLesson ? `/learn/${c.firstLesson}` : "/learn"}
                className="flex gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:border-ajar-teal/40 hover:shadow-md"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ajar-teal/20 to-ajar-indigo/20">
                  <BookOpen className="h-6 w-6 text-ajar-teal/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.total} pelajaran • {user.tenant.name}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ajar-teal to-ajar-indigo"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {c.pct}% • {c.pct === 100 ? "Selesai" : "Sedang berjalan"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function YourCoursesCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
