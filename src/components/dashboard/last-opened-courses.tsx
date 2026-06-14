import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LastOpenedCarousel,
  type CourseCardItem,
} from "@/components/dashboard/last-opened-carousel";

export async function LastOpenedCourses() {
  const user = await requireUser();

  // Most recently touched lessons (resume points).
  const recent = await prisma.progress.findMany({
    where: { userId: user.id, lesson: { module: { course: { tenantId: user.tenantId } } } },
    orderBy: { updatedAt: "desc" },
    take: 8,
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          videoDuration: true,
          module: { select: { title: true } },
        },
      },
    },
  });

  let items: CourseCardItem[] = recent.map((p) => {
    const pct = p.completedAt
      ? 100
      : p.lesson.videoDuration
        ? Math.min(99, Math.round((p.watchedSeconds / p.lesson.videoDuration) * 100))
        : 0;
    return {
      id: p.lesson.id,
      title: p.lesson.title,
      subtitle: p.lesson.module.title,
      instructor: user.tenant.name,
      pct,
    };
  });

  // Fallback: surface the first lessons if nothing watched yet.
  if (items.length === 0) {
    const lessons = await prisma.lesson.findMany({
      where: { module: { course: { tenantId: user.tenantId } } },
      orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
      take: 4,
      select: { id: true, title: true, module: { select: { title: true } } },
    });
    items = lessons.map((l) => ({
      id: l.id,
      title: l.title,
      subtitle: l.module.title,
      instructor: user.tenant.name,
      pct: 0,
    }));
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Last Opened Courses</CardTitle>
        <Link href="/learn" className="text-sm font-medium text-ajar-teal hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada aktivitas. Mulai pelajaran pertamamu!
          </p>
        ) : (
          <LastOpenedCarousel items={items} />
        )}
      </CardContent>
    </Card>
  );
}

export function LastOpenedCoursesSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Last Opened Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 w-64 shrink-0 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
