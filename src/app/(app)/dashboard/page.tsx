import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { syncNotifications } from "@/lib/notifications";
import { evaluateBadges } from "@/lib/badges";
import { GreetingCard, GreetingCardSkeleton } from "@/components/dashboard/greeting-card";
import {
  LearningProgressCard,
  LearningProgressCardSkeleton,
} from "@/components/dashboard/learning-progress-card";
import {
  CourseTaskCard,
  CourseTaskCardSkeleton,
} from "@/components/dashboard/course-task-card";
import {
  StatsPillsCard,
  StatsPillsCardSkeleton,
} from "@/components/dashboard/stats-pills-card";
import {
  LastOpenedCourses,
  LastOpenedCoursesSkeleton,
} from "@/components/dashboard/last-opened-courses";
import {
  LearningStatisticCard,
  LearningStatisticCardSkeleton,
} from "@/components/dashboard/learning-statistic-card";
import {
  YourCoursesCard,
  YourCoursesCardSkeleton,
} from "@/components/dashboard/your-courses-card";
import {
  UpcomingLiveWidget,
  UpcomingLiveWidgetSkeleton,
} from "@/components/dashboard/upcoming-live-widget";
import {
  AnnouncementsWidget,
  AnnouncementsWidgetSkeleton,
} from "@/components/dashboard/announcements-widget";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  await Promise.all([
    evaluateBadges(user.id, user.tenantId),
    syncNotifications(user),
  ]);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <Suspense fallback={<GreetingCardSkeleton />}>
        <GreetingCard />
      </Suspense>

      {/* Row 1 — Progress / Tasks / Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Suspense fallback={<LearningProgressCardSkeleton />}>
          <LearningProgressCard />
        </Suspense>
        <Suspense fallback={<CourseTaskCardSkeleton />}>
          <CourseTaskCard />
        </Suspense>
        <Suspense fallback={<StatsPillsCardSkeleton />}>
          <StatsPillsCard />
        </Suspense>
      </div>

      {/* Row 2 — Last opened (2/3) + Statistics (1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<LastOpenedCoursesSkeleton />}>
            <LastOpenedCourses />
          </Suspense>
        </div>
        <Suspense fallback={<LearningStatisticCardSkeleton />}>
          <LearningStatisticCard />
        </Suspense>
      </div>

      {/* Row 3 — Your courses */}
      <Suspense fallback={<YourCoursesCardSkeleton />}>
        <YourCoursesCard />
      </Suspense>

      {/* Row 4 — Live + Announcements */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<UpcomingLiveWidgetSkeleton />}>
          <UpcomingLiveWidget />
        </Suspense>
        <Suspense fallback={<AnnouncementsWidgetSkeleton />}>
          <AnnouncementsWidget />
        </Suspense>
      </div>
    </div>
  );
}
