import { requireUser } from "@/lib/auth";
import { getWeeklyStats, getMonthlyStats } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningStatChart } from "@/components/dashboard/learning-stat-chart";

export async function LearningStatisticCard() {
  const user = await requireUser();
  const [weekly, monthly] = await Promise.all([
    getWeeklyStats(user.id),
    getMonthlyStats(user.id),
  ]);

  return (
    <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-base">Learning Statistic</CardTitle>
      </CardHeader>
      <CardContent>
        <LearningStatChart weekly={weekly.bars} monthly={monthly} />
      </CardContent>
    </Card>
  );
}

export function LearningStatisticCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Learning Statistic</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
