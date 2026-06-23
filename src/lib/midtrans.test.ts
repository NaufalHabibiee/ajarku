import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import {
  verifyWebhookSignature,
  mapTransactionStatus,
  generateOrderId,
} from "./midtrans";

describe("verifyWebhookSignature", () => {
  const serverKey = "test-server-key";
  const payload = {
    order_id: "SUB-123",
    status_code: "200",
    gross_amount: "99000.00",
  };
  const validSignature = createHash("sha512")
    .update(
      payload.order_id + payload.status_code + payload.gross_amount + serverKey
    )
    .digest("hex");

  it("accepts a correct signature", () => {
    expect(
      verifyWebhookSignature(serverKey, {
        ...payload,
        signature_key: validSignature,
      })
    ).toBe(true);
  });

  it("rejects a tampered signature", () => {
    expect(
      verifyWebhookSignature(serverKey, {
        ...payload,
        signature_key: "deadbeef",
      })
    ).toBe(false);
  });

  it("rejects when the server key differs", () => {
    expect(
      verifyWebhookSignature("wrong-key", {
        ...payload,
        signature_key: validSignature,
      })
    ).toBe(false);
  });
});

describe("mapTransactionStatus", () => {
  it("maps settlement/capture to paid", () => {
    expect(mapTransactionStatus("settlement")).toBe("paid");
    expect(mapTransactionStatus("capture", "accept")).toBe("paid");
  });

  it("treats a fraud challenge as pending", () => {
    expect(mapTransactionStatus("capture", "challenge")).toBe("pending");
  });

  it("maps cancel/deny to failed and expire to expired", () => {
    expect(mapTransactionStatus("cancel")).toBe("failed");
    expect(mapTransactionStatus("deny")).toBe("failed");
    expect(mapTransactionStatus("expire")).toBe("expired");
  });

  it("defaults unknown statuses to pending", () => {
    expect(mapTransactionStatus("something-else")).toBe("pending");
  });
});

describe("generateOrderId", () => {
  it("produces a unique, Midtrans-safe id under 50 chars", () => {
    const a = generateOrderId();
    const b = generateOrderId();
    expect(a).toMatch(/^SUB-\d+-[A-Z0-9]+$/);
    expect(a).not.toBe(b);
    expect(a.length).toBeLessThanOrEqual(50);
  });
});
