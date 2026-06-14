import { Trash2 } from "lucide-react";
import { requireAdminContext } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { deleteAnnouncement } from "@/lib/actions/announcements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Announcements" };

export default async function AdminAnnouncementsPage() {
  const { tenant } = await requireAdminContext();
  const announcements = await prisma.announcement.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Announcements</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {announcements.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No announcements yet.
          </div>
        )}
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.createdAt.toLocaleString()}
                </p>
              </div>
              <form action={deleteAnnouncement}>
                <input type="hidden" name="id" value={a.id} />
                <Button variant="ghost" size="icon" type="submit">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
