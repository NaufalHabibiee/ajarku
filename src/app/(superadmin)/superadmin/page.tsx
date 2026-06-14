import Link from "next/link";
import {
  Building2,
  Wallet,
  Users,
  BadgeCheck,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getPlatformStats, PLATFORM_FEE_RATE } from "@/lib/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Platform Console" };

export default async function SuperAdminDashboard() {
  await requireSuperAdmin();
  const stats = await getPlatformStats();

  const recentTenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { users: true } } },
  });

  const cards = [
    {
      label: "Revenue this month",
      value: formatIDR(stats.revenueThisMonth),
      sub: `${stats.paidCountThisMonth} payments`,
      icon: Wallet,
    },
    {
      label: "Platform cut (this month)",
      value: formatIDR(stats.platformCutThisMonth),
      sub: `${Math.round(PLATFORM_FEE_RATE * 100)}% share`,
      icon: TrendingUp,
    },
    {
      label: "Active subscribers",
      value: stats.activeSubscriptions,
      sub: `${stats.students} students total`,
      icon: BadgeCheck,
    },
    {
      label: "Tenants",
      value: stats.tenants,
      sub: `${stats.activeTenants} active`,
      icon: Building2,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Platform overview.</p>
        </div>
        <Button asChild variant="brand">
          <Link href="/superadmin/tenants/new">
            <Plus className="mr-2 h-4 w-4" /> New tenant
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Recent tenants</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/superadmin/tenants">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentTenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tenants yet.</p>
          ) : (
            <ul className="divide-y">
              {recentTenants.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.slug} · {t._count.users} users
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        t.subscriptionStatus === "active"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {t.subscriptionStatus}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/superadmin/tenants/${t.id}`}>Manage</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
