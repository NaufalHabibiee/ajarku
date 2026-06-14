import { Flame, Clock, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getWeeklyStats } from "@/lib/dashboard";
import { Card, CardContent } from "@/components/ui/card";

export async function StatsPillsCard() {
  const user = await requireUser();
  const weekly = await getWeeklyStats(user.id);

  const stats = [
    {
      icon: Flame,
      value: `${user.currentStreak}`,
      suffix: "🔥",
      label: "Hari streak",
      tint: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: Clock,
      value: `${weekly.minutesThisWeek}`,
      suffix: "menit",
      label: "Minggu ini",
      tint: "bg-ajar-teal/10 text-ajar-teal",
    },
    {
      icon: CheckCircle2,
      value: `${weekly.lessonsThisWeek}`,
      suffix: "pelajaran",
      label: "Selesai minggu ini",
      tint: "bg-ajar-indigo/10 text-ajar-indigo",
    },
  ];

  return (
    <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
        {stats.map(({ icon: Icon, value, suffix, label, tint }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-bold leading-none">
                {value}{" "}
                <span className="text-sm font-medium text-muted-foreground">
                  {suffix}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function StatsPillsCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}
