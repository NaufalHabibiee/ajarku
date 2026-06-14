import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <Compass className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-3xl font-bold">404</h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t find the page you were looking for.
      </p>
      <Button asChild variant="brand">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
