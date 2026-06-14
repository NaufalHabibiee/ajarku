"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const SNAP_SCRIPT_ID = "midtrans-snap";

function loadSnap(snapJsUrl: string, clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    const existing = document.getElementById(SNAP_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("snap load")));
      return;
    }
    const script = document.createElement("script");
    script.id = SNAP_SCRIPT_ID;
    script.src = snapJsUrl;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load payment module"));
    document.body.appendChild(script);
  });
}

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not start payment.");
      }

      await loadSnap(data.snapJsUrl, data.clientKey);
      const orderId = data.orderId as string;

      window.snap?.pay(data.token, {
        onSuccess: () =>
          router.push(`/payment/success?order_id=${orderId}`),
        onPending: () =>
          router.push(`/payment/pending?order_id=${orderId}`),
        onError: () => router.push(`/payment/failed?order_id=${orderId}`),
        onClose: () => setLoading(false),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        variant="brand"
        size="lg"
        className="w-full"
        onClick={handleClick}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Pay & subscribe
      </Button>
    </div>
  );
}
