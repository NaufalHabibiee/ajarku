import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMidtransConfig, verifyWebhookSignature } from "@/lib/midtrans";
import { applyTransactionResult } from "@/lib/payment";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = String(body.order_id ?? "");
  const statusCode = String(body.status_code ?? "");
  const grossAmount = String(body.gross_amount ?? "");
  const signatureKey = String(body.signature_key ?? "");

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  // Resolve the subscription (and its tenant) from the order id.
  const subscription = await prisma.subscription.findUnique({
    where: { midtransOrderId: orderId },
    include: { tenant: true, user: true },
  });
  if (!subscription) {
    // Unknown order — acknowledge to stop retries but do nothing.
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Verify the signature against the tenant's server key.
  const { serverKey } = getMidtransConfig(subscription.tenant);
  const valid = verifyWebhookSignature(serverKey, {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  await applyTransactionResult(subscription, {
    transaction_status: body.transaction_status
      ? String(body.transaction_status)
      : undefined,
    fraud_status: body.fraud_status ? String(body.fraud_status) : undefined,
    payment_type: body.payment_type ? String(body.payment_type) : undefined,
    transaction_id: body.transaction_id
      ? String(body.transaction_id)
      : undefined,
  });

  return NextResponse.json({ ok: true });
}
