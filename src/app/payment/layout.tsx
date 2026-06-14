import { getTenant } from "@/lib/tenant";
import { TenantBranding } from "@/components/tenant-branding";

export const dynamic = "force-dynamic";

export default async function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <TenantBranding tenant={tenant} />
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}
