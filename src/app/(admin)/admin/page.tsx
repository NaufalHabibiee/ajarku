import Link from "next/link";
import { Users, BadgeCheck, Wallet, BookOpen } from "lucide-react";
import { requireAdminContext } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const { tenant } = await requireAdminContext();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [students, activeSubs, revenueAgg, lessonCount] = await Promise.all([
    prisma.user.count({ where: { tenantId: tenant.id, role: "student" } }),
    prisma.user.count({
      where: {
        tenantId: tenant.id,
        isSubscribed: true,
        subscriptionExpiry: { gt: new Date() },
      },
    }),
    prisma.subscription.aggregate({
      where: { tenantId: tenant.id, status: "paid", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.lesson.count({
      where: { module: { course: { tenantId: tenant.id } } },
    }),
  ]);

  const revenue = revenueAgg._sum.amount ?? 0;

  const stats = [
    { label: "Students", value: students, icon: Users },
    { label: "Active subscribers", value: activeSubs, icon: BadgeCheck },
    { label: "Revenue this month", value: formatIDR(revenue), icon: Wallet },
    { label: "Lessons", value: lessonCount, icon: BookOpen },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of {tenant.name}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="brand">
            <Link href="/admin/lessons/new">Add lesson</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/curriculum">Manage curriculum</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/live">Schedule live session</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/announcements">Post announcement</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
