import {
  Building2,
  Users,
  GraduationCap,
  BadgeCheck,
  BookOpen,
  PlayCircle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getPlatformStats } from "@/lib/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requireSuperAdmin();
  const stats = await getPlatformStats();

  // Revenue by payment method across the platform.
  const byMethod = await prisma.subscription.groupBy({
    by: ["paymentMethod"],
    where: { status: "paid" },
    _sum: { amount: true },
    _count: true,
  });

  const sections: {
    title: string;
    items: { label: string; value: string | number; icon: React.ElementType }[];
  }[] = [
    {
      title: "Audience",
      items: [
        { label: "Total users", value: stats.users, icon: Users },
        { label: "Students", value: stats.students, icon: GraduationCap },
        {
          label: "Active subscriptions",
          value: stats.activeSubscriptions,
          icon: BadgeCheck,
        },
        { label: "Tenants", value: stats.tenants, icon: Building2 },
      ],
    },
    {
      title: "Content",
      items: [
        { label: "Courses", value: stats.courses, icon: BookOpen },
        { label: "Published", value: stats.publishedCourses, icon: BookOpen },
        { label: "Lessons", value: stats.lessons, icon: PlayCircle },
        { label: "Active tenants", value: stats.activeTenants, icon: Building2 },
      ],
    },
    {
      title: "Revenue",
      items: [
        {
          label: "This month",
          value: formatIDR(stats.revenueThisMonth),
          icon: Wallet,
        },
        {
          label: "All-time",
          value: formatIDR(stats.revenueAllTime),
          icon: Wallet,
        },
        {
          label: "Platform cut (month)",
          value: formatIDR(stats.platformCutThisMonth),
          icon: TrendingUp,
        },
        {
          label: "Platform cut (all-time)",
          value: formatIDR(stats.platformCutAllTime),
          icon: TrendingUp,
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform-wide statistics.</p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {section.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue by payment method</CardTitle>
        </CardHeader>
        <CardContent>
          {byMethod.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <ul className="divide-y">
              {byMethod.map((m) => (
                <li
                  key={m.paymentMethod ?? "unknown"}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="capitalize">
                    {(m.paymentMethod ?? "unknown").replace("_", " ")}
                  </span>
                  <span className="text-muted-foreground">
                    {m._count} payment{m._count === 1 ? "" : "s"} ·{" "}
                    <span className="font-medium text-foreground">
                      {formatIDR(m._sum.amount ?? 0)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
