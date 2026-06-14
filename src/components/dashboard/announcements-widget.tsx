import { Bell } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { relativeTimeID } from "@/lib/time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnnouncementsList,
  type AnnouncementItem,
} from "@/components/dashboard/announcements-list";

export async function AnnouncementsWidget() {
  const user = await requireUser();

  const [announcements, annNotifs] = await Promise.all([
    prisma.announcement.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notification.findMany({
      where: { userId: user.id, type: "announcement" },
      select: { refId: true, isRead: true },
    }),
  ]);

  const readMap = new Map(annNotifs.map((n) => [n.refId, n.isRead]));
  const items: AnnouncementItem[] = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    timeAgo: relativeTimeID(a.createdAt),
    unread: readMap.get(a.id) !== true,
  }));

  return (
    <Card
      id="pengumuman"
      className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-4 w-4" /> Pengumuman
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnnouncementsList items={items} />
      </CardContent>
    </Card>
  );
}

export function AnnouncementsWidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pengumuman</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}
