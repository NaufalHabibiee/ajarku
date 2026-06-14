import Link from "next/link";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { settleFromMidtrans } from "@/lib/payment";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment pending" };

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const orderId = searchParams.order_id;
  if (orderId) await settleFromMidtrans(orderId);

  const subscription = orderId
    ? await prisma.subscription.findUnique({
        where: { midtransOrderId: orderId },
      })
    : null;

  // If the webhook already settled it, jump to success.
  const paid = subscription?.status === "paid";

  return (
    <>
      <Clock className="mx-auto mb-4 h-14 w-14 text-amber-500" />
      <h1 className="text-2xl font-bold">
        {paid ? "Payment confirmed!" : "Waiting for payment"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {paid
          ? "Your subscription is now active."
          : "Complete your payment using the instructions from your bank or e-wallet. We'll unlock your access automatically once it's confirmed."}
      </p>

      {paid ? (
        <Button asChild variant="brand" className="mt-6 w-full">
          <Link href="/learn">Start learning</Link>
        </Button>
      ) : (
        <>
          <Button asChild variant="brand" className="mt-6 w-full">
            <Link href="/subscription">Check status</Link>
          </Button>
          {orderId && (
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href={`/payment/pending?order_id=${orderId}`}>Refresh</Link>
            </Button>
          )}
        </>
      )}
    </>
  );
}
