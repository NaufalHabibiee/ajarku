import type { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getMidtransConfig,
  getTransactionStatus,
  mapTransactionStatus,
} from "@/lib/midtrans";

const SUBSCRIPTION_DAYS = 30;

export function mapPaymentMethod(paymentType?: string): PaymentMethod | null {
  switch (paymentType) {
    case "gopay":
      return "gopay";
    case "qris":
      return "qris";
    case "bank_transfer":
    case "echannel":
    case "permata":
      return "bank_transfer";
    default:
      return null;
  }
}

type MidtransResult = {
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
};

type SubscriptionWithUser = Prisma.SubscriptionGetPayload<{
  include: { user: true };
}>;

/**
 * Apply a Midtrans transaction result to a subscription, activating the user's
 * access when paid. Idempotent: a subscription already marked paid is left
 * untouched. Returns the resulting internal status.
 */
export async function applyTransactionResult(
  subscription: SubscriptionWithUser,
  result: MidtransResult
): Promise<"paid" | "pending" | "failed" | "expired"> {
  if (subscription.status === "paid") return "paid";

  const status = mapTransactionStatus(
    result.transaction_status ?? "",
    result.fraud_status
  );
  const method = mapPaymentMethod(result.payment_type);

  if (status === "paid") {
    const base =
      subscription.user.subscriptionExpiry &&
      subscription.user.subscriptionExpiry.getTime() > Date.now()
        ? subscription.user.subscriptionExpiry
        : new Date();
    const expiresAt = new Date(base);
    expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DAYS);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          expiresAt,
          midtransTransactionId: result.transaction_id,
          paymentMethod: method,
        },
      }),
      prisma.user.update({
        where: { id: subscription.userId },
        data: {
          isSubscribed: true,
          subscriptionExpiry: expiresAt,
          subscriptionId: subscription.id,
        },
      }),
    ]);
    return "paid";
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status,
      midtransTransactionId: result.transaction_id,
      paymentMethod: method,
    },
  });
  return status;
}

/**
 * Verify-on-return: pull the latest status from Midtrans for an order and apply
 * it. Used by the success/pending pages so access activates even when the
 * webhook can't reach the server (e.g. local dev).
 */
export async function settleFromMidtrans(orderId: string): Promise<
  "paid" | "pending" | "failed" | "expired" | null
> {
  const subscription = await prisma.subscription.findUnique({
    where: { midtransOrderId: orderId },
    include: { user: true, tenant: true },
  });
  if (!subscription) return null;
  if (subscription.status === "paid") return "paid";

  const config = getMidtransConfig(subscription.tenant);
  if (!config.serverKey) return subscription.status;

  const data = await getTransactionStatus(config, orderId);
  if (!data) return subscription.status;

  return applyTransactionResult(subscription, {
    transaction_status: data.transaction_status as string | undefined,
    fraud_status: data.fraud_status as string | undefined,
    payment_type: data.payment_type as string | undefined,
    transaction_id: data.transaction_id as string | undefined,
  });
}
