import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import {
  createSnapTransaction,
  generateOrderId,
  getMidtransConfig,
} from "@/lib/midtrans";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenant = await requireTenant();

  const config = getMidtransConfig(tenant);
  if (!config.serverKey || !config.clientKey) {
    return NextResponse.json(
      { error: "Payments are not configured for this site." },
      { status: 503 }
    );
  }

  const amount = tenant.subscriptionPrice;
  const orderId = generateOrderId();
  const origin = new URL(request.url).origin;

  // Create the pending subscription record up front so the webhook can resolve
  // the user/tenant from the order id later.
  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      amount,
      status: "pending",
      midtransOrderId: orderId,
    },
  });

  try {
    const snap = await createSnapTransaction(config, {
      orderId,
      amount,
      customer: { name: user.name, email: user.email },
      itemName: `${tenant.name} — 1 month subscription`,
      callbackFinishUrl: `${origin}/payment/pending?order_id=${orderId}`,
    });

    return NextResponse.json({
      token: snap.token,
      clientKey: config.clientKey,
      snapJsUrl: config.snapJsUrl,
      orderId,
    });
  } catch (err) {
    await prisma.subscription.update({
      where: { midtransOrderId: orderId },
      data: { status: "failed" },
    });
    console.error("Snap create failed:", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 }
    );
  }
}
