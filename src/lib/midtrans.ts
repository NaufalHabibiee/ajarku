import { createHash } from "crypto";
import type { Tenant } from "@prisma/client";

export type MidtransConfig = {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
  snapApiUrl: string;
  snapJsUrl: string;
};

/**
 * Resolve the effective Midtrans config for a tenant, falling back to the
 * platform default keys when the tenant hasn't configured its own.
 */
export function getMidtransConfig(tenant: Tenant): MidtransConfig {
  const serverKey =
    tenant.midtransServerKey || process.env.MIDTRANS_SERVER_KEY || "";
  const clientKey =
    tenant.midtransClientKey ||
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
    "";
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  return {
    serverKey,
    clientKey,
    isProduction,
    snapApiUrl: isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions",
    snapJsUrl: isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js",
  };
}

export const ENABLED_PAYMENTS = [
  "bca_va",
  "bni_va",
  "bri_va",
  "mandiri_bill",
  "permata_va",
  "gopay",
  "qris",
] as const;

export type CreateSnapParams = {
  orderId: string;
  amount: number; // IDR, integer
  customer: { name?: string | null; email: string };
  itemName: string;
  callbackFinishUrl: string;
};

type SnapResponse = { token: string; redirect_url: string };

/** Create a Snap transaction and return its token. Throws on API error. */
export async function createSnapTransaction(
  config: MidtransConfig,
  params: CreateSnapParams
): Promise<SnapResponse> {
  const auth = Buffer.from(`${config.serverKey}:`).toString("base64");

  const [firstName, ...rest] = (params.customer.name ?? "Student").split(" ");

  const res = await fetch(config.snapApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      item_details: [
        {
          id: "subscription-monthly",
          name: params.itemName.slice(0, 50),
          price: params.amount,
          quantity: 1,
        },
      ],
      customer_details: {
        first_name: firstName,
        last_name: rest.join(" ") || undefined,
        email: params.customer.email,
      },
      enabled_payments: [...ENABLED_PAYMENTS],
      callbacks: { finish: params.callbackFinishUrl },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Midtrans Snap error ${res.status}: ${text}`);
  }
  return (await res.json()) as SnapResponse;
}

/** Query the current status of a transaction (server-to-server). */
export async function getTransactionStatus(
  config: MidtransConfig,
  orderId: string
): Promise<Record<string, unknown> | null> {
  const auth = Buffer.from(`${config.serverKey}:`).toString("base64");
  const base = config.isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
  const res = await fetch(`${base}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

/**
 * Verify a Midtrans webhook signature.
 * signature = sha512(order_id + status_code + gross_amount + server_key)
 */
export function verifyWebhookSignature(
  serverKey: string,
  payload: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
  }
): boolean {
  const expected = createHash("sha512")
    .update(
      payload.order_id +
        payload.status_code +
        payload.gross_amount +
        serverKey
    )
    .digest("hex");
  return expected === payload.signature_key;
}

/** Generate a unique, Midtrans-safe order id (<= 50 chars, [A-Za-z0-9-_]). */
export function generateOrderId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SUB-${Date.now()}-${rand}`;
}

/** Map a Midtrans transaction_status to our internal PaymentStatus. */
export function mapTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string
): "paid" | "pending" | "failed" | "expired" {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "challenge" ? "pending" : "paid";
    case "settlement":
      return "paid";
    case "pending":
      return "pending";
    case "deny":
    case "cancel":
      return "failed";
    case "expire":
      return "expired";
    default:
      return "pending";
  }
}
