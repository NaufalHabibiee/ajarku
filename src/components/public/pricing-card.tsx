import Link from "next/link";
import { Check } from "lucide-react";
import type { Tenant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";

const FEATURES = [
  "Full course access — all modules & lessons",
  "New lessons added regularly",
  "Downloadable resources & attachments",
  "Live sessions & recordings",
  "Community forum access",
  "Certificate of completion",
];

export function PricingCard({
  tenant,
  ctaHref = "/subscribe",
}: {
  tenant: Tenant;
  ctaHref?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">Monthly access</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-bold">
          {formatIDR(tenant.subscriptionPrice)}
        </span>
        <span className="text-muted-foreground">/month</span>
      </div>
      <ul className="mt-6 space-y-3">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant="brand" size="lg" className="mt-8 w-full">
        <Link href={ctaHref}>Subscribe now</Link>
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Cancel anytime. Pay with Bank Transfer, GoPay or QRIS.
      </p>
    </div>
  );
}
