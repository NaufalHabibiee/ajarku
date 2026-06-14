import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getTenantBilling } from "@/lib/platform";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tenants" };

export default async function TenantsPage() {
  await requireSuperAdmin();

  const [tenants, billing] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { users: true, courses: true } } },
    }),
    getTenantBilling(),
  ]);
  const revenueMap = new Map(billing.map((b) => [b.id, b.revenueAllTime]));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-muted-foreground">All client sites on the platform.</p>
        </div>
        <Button asChild variant="brand">
          <Link href="/superadmin/tenants/new">
            <Plus className="mr-2 h-4 w-4" /> New tenant
          </Link>
        </Button>
      </div>

      {tenants.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No tenants yet. Create your first client site.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Users</th>
                    <th className="px-4 py-3 font-medium">Courses</th>
                    <th className="px-4 py-3 font-medium">Revenue</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.slug}
                          {t.customDomain ? ` · ${t.customDomain}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            t.subscriptionStatus === "active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {t.subscriptionStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t._count.users}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t._count.courses}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatIDR(revenueMap.get(t.id) ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/superadmin/tenants/${t.id}`}>Manage</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
