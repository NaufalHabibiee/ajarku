import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { settleFromMidtrans } from "@/lib/payment";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment successful" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const orderId = searchParams.order_id;
  // Pull the latest status from Midtrans and activate access if paid (works
  // even when the webhook can't reach this server, e.g. local dev).
  if (orderId) await settleFromMidtrans(orderId);

  const subscription = orderId
    ? await prisma.subscription.findUnique({
        where: { midtransOrderId: orderId },
      })
    : null;

  const confirmed = subscription?.status === "paid";

  if (confirmed) {
    return (
      <>
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
        <h1 className="text-2xl font-bold">You&apos;re all set!</h1>
        <p className="mt-2 text-muted-foreground">
          Your subscription is active. Every lesson is now unlocked.
        </p>
        {subscription?.expiresAt && (
          <p className="mt-1 text-sm text-muted-foreground">
            Access until {subscription.expiresAt.toLocaleDateString()}
          </p>
        )}
        <Button asChild variant="brand" className="mt-6 w-full">
          <Link href="/learn">Start learning</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Clock className="mx-auto mb-4 h-14 w-14 text-amber-500" />
      <h1 className="text-2xl font-bold">Confirming your payment…</h1>
      <p className="mt-2 text-muted-foreground">
        Thanks! We received your payment and are activating your access. This
        usually takes a few seconds.
      </p>
      <Button asChild variant="brand" className="mt-6 w-full">
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
      {orderId && (
        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link href={`/payment/success?order_id=${orderId}`}>
            Refresh status
          </Link>
        </Button>
      )}
    </>
  );
}
