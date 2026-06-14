import { Trash2, Video, Calendar } from "lucide-react";
import { requireAdminContext } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { setRecordingUrl, deleteLiveSession } from "@/lib/actions/live";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { LiveForm } from "@/components/admin/live-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live sessions" };

export default async function AdminLivePage() {
  const { tenant } = await requireAdminContext();
  const sessions = await prisma.liveSession.findMany({
    where: { tenantId: tenant.id },
    orderBy: { scheduledAt: "desc" },
  });

  const now = Date.now();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Live sessions</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schedule a session</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sessions.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No sessions scheduled yet.
          </div>
        )}
        {sessions.map((s) => {
          const upcoming = s.scheduledAt.getTime() > now;
          return (
            <Card key={s.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{s.title}</h3>
                      <Badge variant={upcoming ? "brand" : "secondary"}>
                        {upcoming ? "Upcoming" : "Past"}
                      </Badge>
                    </div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {s.scheduledAt.toLocaleString()}
                    </p>
                    {s.meetUrl && (
                      <a
                        href={s.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand hover:underline"
                      >
                        {s.meetUrl}
                      </a>
                    )}
                  </div>
                  <form action={deleteLiveSession}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button variant="ghost" size="icon" type="submit">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                </div>

                <form action={setRecordingUrl} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={s.id} />
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <Input
                    name="recordingUrl"
                    defaultValue={s.recordingUrl ?? ""}
                    placeholder="Recording URL (YouTube / Bunny)…"
                    className="h-8"
                  />
                  <SubmitButton variant="outline" size="sm">
                    Save
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
