import { Calendar, Radio, Video, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live Sessions" };

export default async function LivePage() {
  const user = await requireUser();
  const sessions = await prisma.liveSession.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { scheduledAt: "desc" },
  });

  const now = Date.now();
  const upcoming = sessions
    .filter((s) => s.scheduledAt.getTime() > now)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  const past = sessions.filter((s) => s.scheduledAt.getTime() <= now);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">Live Sessions</h1>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Radio className="h-4 w-4" /> Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No upcoming sessions scheduled.
          </div>
        ) : (
          upcoming.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.title}</h3>
                    <Badge variant="brand">Upcoming</Badge>
                  </div>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {s.scheduledAt.toLocaleString()}
                  </p>
                  {s.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.description}
                    </p>
                  )}
                </div>
                {s.meetUrl && (
                  <Button asChild variant="brand">
                    <a href={s.meetUrl} target="_blank" rel="noopener noreferrer">
                      Join <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Video className="h-4 w-4" /> Past sessions &amp; replays
        </h2>
        {past.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No past sessions yet.
          </div>
        ) : (
          past.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {s.scheduledAt.toLocaleString()}
                  </p>
                </div>
                {s.recordingUrl ? (
                  <Button asChild variant="outline">
                    <a
                      href={s.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch replay <Video className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Badge variant="secondary">No replay</Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
