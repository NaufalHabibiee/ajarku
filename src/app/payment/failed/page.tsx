import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment failed" };

export default function PaymentFailedPage() {
  return (
    <>
      <XCircle className="mx-auto mb-4 h-14 w-14 text-destructive" />
      <h1 className="text-2xl font-bold">Payment failed</h1>
      <p className="mt-2 text-muted-foreground">
        Your payment didn&apos;t go through or was cancelled. No charge was made.
        You can try again with a different method.
      </p>
      <Button asChild variant="brand" className="mt-6 w-full">
        <Link href="/subscribe">Try again</Link>
      </Button>
      <Button asChild variant="ghost" className="mt-2 w-full">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </>
  );
}
