import { Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BADGE_CATALOG } from "@/lib/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AchievementsRow,
  type AchievementItem,
} from "@/components/dashboard/achievements-row";

export async function AchievementsWidget() {
  const user = await requireUser();
  const badges = await prisma.badge.findMany({
    where: { userId: user.id },
    select: { badgeKey: true },
  });
  const earned = new Set(badges.map((b) => b.badgeKey));

  const items: AchievementItem[] = BADGE_CATALOG.map((b) => ({
    key: b.key,
    emoji: b.emoji,
    title: b.title,
    description: b.description,
    howTo: b.howTo,
    earned: earned.has(b.key),
  }));

  return (
    <Card id="pencapaian" className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-4 w-4 text-brand" /> Pencapaian
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AchievementsRow items={items} />
      </CardContent>
    </Card>
  );
}

export function AchievementsWidgetSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Pencapaian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
