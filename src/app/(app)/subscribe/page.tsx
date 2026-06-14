import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import { hasActiveSubscription } from "@/lib/auth";
import { SubscribeButton } from "@/components/payment/subscribe-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscribe" };

const INCLUDES = [
  "Every lesson, unlocked",
  "Downloadable resources",
  "Live sessions & replays",
  "Community forum access",
  "Certificate on completion",
];

const METHODS = [
  "Bank Transfer (BCA, Mandiri, BNI, BRI)",
  "GoPay",
  "QRIS",
];

export default async function SubscribePage() {
  const user = await requireUser();
  const tenant = await requireTenant();

  // Already subscribed → send to subscription management.
  if (hasActiveSubscription(user)) {
    redirect("/subscription");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Subscribe to {tenant.name}</h1>
        <p className="text-muted-foreground">
          Unlock the full course for one month.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">
              {formatIDR(tenant.subscriptionPrice)}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-2">
            {INCLUDES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-brand" />
                {f}
              </li>
            ))}
          </ul>

          <SubscribeButton />

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Pay with
            </p>
            <ul className="space-y-1 text-sm">
              {METHODS.map((m) => (
                <li key={m} className="text-muted-foreground">
                  · {m}
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secured by Midtrans. Activated instantly on payment.
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-sm">
        <Button asChild variant="ghost" size="sm">
          <Link href="/learn">Maybe later</Link>
        </Button>
      </p>
    </div>
  );
}
