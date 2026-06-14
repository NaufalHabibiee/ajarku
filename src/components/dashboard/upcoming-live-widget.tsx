import { Calendar, CalendarPlus, Radio, Video } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatWIBDateTime, googleCalendarLink } from "@/lib/time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export async function UpcomingLiveWidget() {
  const user = await requireUser();
  const now = new Date();

  // Include sessions that are upcoming or currently live (started < 2h ago).
  const sessions = await prisma.liveSession.findMany({
    where: {
      tenantId: user.tenantId,
      scheduledAt: { gt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    },
    orderBy: { scheduledAt: "asc" },
    take: 3,
  });

  return (
    <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radio className="h-4 w-4 text-brand" /> Live session mendatang
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Video className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada live session terjadwal. Pantau terus ya! 🎥
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => {
              const started = s.scheduledAt.getTime() <= now.getTime();
              const gcal = googleCalendarLink({
                title: s.title,
                start: s.scheduledAt,
                details: s.description ?? `Live session ${user.tenant.name}`,
                location: s.meetUrl ?? "",
              });
              return (
                <li
                  key={s.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{s.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatWIBDateTime(s.scheduledAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        oleh {user.tenant.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button asChild variant="outline" size="sm" title="Tambah ke Kalender">
                        <a href={gcal} target="_blank" rel="noopener noreferrer">
                          <CalendarPlus className="h-4 w-4" />
                        </a>
                      </Button>
                      {started && s.meetUrl ? (
                        <Button asChild variant="brand" size="sm">
                          <a href={s.meetUrl} target="_blank" rel="noopener noreferrer">
                            Bergabung
                          </a>
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" disabled>
                          Belum dimulai
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingLiveWidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Live session mendatang</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}
