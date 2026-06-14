import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import { hasActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscription" };

const STATUS_VARIANT = {
  paid: "success",
  pending: "secondary",
  failed: "destructive",
  expired: "outline",
} as const;

export default async function SubscriptionPage() {
  const user = await requireUser();
  const tenant = await requireTenant();
  const active = hasActiveSubscription(user);

  const history = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const expiry = user.subscriptionExpiry;
  const daysLeft = expiry
    ? Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Subscription</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            Current plan
            {active ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {active ? (
            <>
              <p className="text-sm text-muted-foreground">
                You have full access to {tenant.name}.
              </p>
              {expiry && (
                <p className="text-sm">
                  Renews/expires on{" "}
                  <span className="font-medium">
                    {expiry.toLocaleDateString()}
                  </span>{" "}
                  ({daysLeft} day{daysLeft === 1 ? "" : "s"} left)
                </p>
              )}
              {daysLeft <= 7 && (
                <div className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-700">
                  Your access expires soon. Renew to keep learning without
                  interruption.
                </div>
              )}
              <Button asChild variant="brand">
                <Link href="/subscribe">Renew now</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Subscribe to unlock every lesson for{" "}
                {formatIDR(tenant.subscriptionPrice)}/month.
              </p>
              <Button asChild variant="brand">
                <Link href="/subscribe">Subscribe</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <ul className="divide-y">
              {history.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{formatIDR(s.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.createdAt.toLocaleDateString()} · {s.midtransOrderId}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
