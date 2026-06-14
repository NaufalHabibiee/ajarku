import { requireSuperAdmin } from "@/lib/admin";
import { getTenantBilling, PLATFORM_FEE_RATE } from "@/lib/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing" };

export default async function BillingPage() {
  await requireSuperAdmin();
  const billing = await getTenantBilling();

  const feePct = Math.round(PLATFORM_FEE_RATE * 100);
  const totalRevenue = billing.reduce((s, b) => s + b.revenueAllTime, 0);
  const totalCut = billing.reduce((s, b) => s + b.platformCut, 0);
  const totalPayout = billing.reduce((s, b) => s + b.tenantPayout, 0);
  const payingCount = billing.filter((b) => b.isPaying).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Revenue share across all tenants ({feePct}% platform fee).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Gross revenue", value: formatIDR(totalRevenue) },
          { label: `Platform earnings (${feePct}%)`, value: formatIDR(totalCut) },
          { label: "Tenant payouts", value: formatIDR(totalPayout) },
          { label: "Paying tenants", value: `${payingCount}/${billing.length}` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue share by tenant</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {billing.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No tenants yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Paying</th>
                    <th className="px-4 py-3 font-medium">Payments</th>
                    <th className="px-4 py-3 font-medium">This month</th>
                    <th className="px-4 py-3 font-medium">All-time</th>
                    <th className="px-4 py-3 font-medium">
                      Platform ({feePct}%)
                    </th>
                    <th className="px-4 py-3 font-medium">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {billing.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        {b.isPaying ? (
                          <Badge variant="success">Paying</Badge>
                        ) : (
                          <Badge variant="secondary">No revenue</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {b.paidCount}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatIDR(b.revenueThisMonth)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatIDR(b.revenueAllTime)}
                      </td>
                      <td className="px-4 py-3 text-brand">
                        {formatIDR(b.platformCut)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatIDR(b.tenantPayout)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Platform fee is configurable via the <code>PLATFORM_FEE_RATE</code>{" "}
        environment variable (default 0.2 = 20%).
      </p>
    </div>
  );
}
