import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSuperAdmin } from "@/lib/admin";
import { createTenant } from "@/lib/actions/superadmin";
import { TenantForm } from "@/components/superadmin/tenant-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "New tenant" };

export default async function NewTenantPage() {
  await requireSuperAdmin();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/superadmin">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to tenants
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Create tenant</h1>
      <TenantForm action={createTenant} />
    </div>
  );
}
