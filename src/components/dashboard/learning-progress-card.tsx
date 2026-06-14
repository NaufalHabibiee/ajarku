import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeeklyStats } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function LearningProgressCard() {
  const user = await requireUser();

  const course = await prisma.course.findFirst({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "asc" },
    include: { modules: { include: { lessons: { select: { id: true } } } } },
  });
  const lessonIds = course?.modules.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
  const total = lessonIds.length;

  const [completed, weekly] = await Promise.all([
    total > 0
      ? prisma.progress.count({
          where: { userId: user.id, completedAt: { not: null }, lessonId: { in: lessonIds } },
        })
      : Promise.resolve(0),
    getWeeklyStats(user.id),
  ]);

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;
  let estimate: string;
  if (total === 0) estimate = "Belum ada pelajaran.";
  else if (remaining === 0) estimate = "Kursus selesai! 🎉";
  else if (weekly.lessonsThisWeek > 0)
    estimate = `~${Math.ceil(remaining / weekly.lessonsThisWeek)} minggu lagi dengan pace saat ini`;
  else estimate = `Sisa ${remaining} pelajaran lagi`;

  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-base">Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="#14B8A6"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{pct}%</span>
            <span className="text-[11px] text-muted-foreground">Completed</span>
          </div>
        </div>
        <p className="text-sm font-medium">
          {completed} of {total} pelajaran
        </p>
        <p className="text-center text-xs text-muted-foreground">{estimate}</p>
        <Link href="/learn" className="text-sm font-medium text-ajar-teal hover:underline">
          View details →
        </Link>
      </CardContent>
    </Card>
  );
}

export function LearningProgressCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <div className="h-36 w-36 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
