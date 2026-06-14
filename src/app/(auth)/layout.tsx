import Link from "next/link";
import { getTenant } from "@/lib/tenant";
import { TenantBranding } from "@/components/tenant-branding";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <TenantBranding tenant={tenant} />
      <Link href="/" className="mb-6 text-xl font-bold">
        {tenant?.name ?? "Online Course"}
      </Link>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
