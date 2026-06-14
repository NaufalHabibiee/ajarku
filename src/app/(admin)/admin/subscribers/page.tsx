import { requireAdminContext } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const { tenant } = await requireAdminContext();
  const users = await prisma.user.findMany({
    where: { tenantId: tenant.id, role: "student" },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();
  const activeCount = users.filter(
    (u) => u.isSubscribed && u.subscriptionExpiry && u.subscriptionExpiry.getTime() > now
  ).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscribers</h1>
        <div className="flex gap-2 text-sm">
          <Badge variant="secondary">{users.length} students</Badge>
          <Badge variant="success">{activeCount} active</Badge>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No students have registered yet.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Expires</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => {
                    const active =
                      u.isSubscribed &&
                      u.subscriptionExpiry &&
                      u.subscriptionExpiry.getTime() > now;
                    return (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{u.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          {active ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.subscriptionExpiry
                            ? u.subscriptionExpiry.toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.createdAt.toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
