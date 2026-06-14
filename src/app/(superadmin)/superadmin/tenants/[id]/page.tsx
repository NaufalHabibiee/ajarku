import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateTenant, toggleTenantStatus } from "@/lib/actions/superadmin";
import { TenantForm } from "@/components/superadmin/tenant-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage tenant" };

export default async function TenantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireSuperAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: { _count: { select: { users: true, courses: true } } },
  });
  if (!tenant) notFound();

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
  const isActive = tenant.subscriptionStatus === "active";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/superadmin">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to tenants
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tenant.name}</h1>
          <a
            href={`http://${tenant.slug}.${rootDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
          >
            {tenant.slug}.{rootDomain} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <Badge variant={isActive ? "success" : "secondary"}>
          {tenant.subscriptionStatus}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tenant._count.users} users · {tenant._count.courses} course(s).
            {isActive
              ? " Site is live."
              : " Site is suspended."}
          </p>
          <form action={toggleTenantStatus}>
            <input type="hidden" name="id" value={tenant.id} />
            <SubmitButton variant={isActive ? "outline" : "brand"} size="sm">
              {isActive ? "Suspend" : "Activate"}
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <TenantForm
            action={updateTenant}
            tenant={{
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              customDomain: tenant.customDomain,
              subscriptionPrice: tenant.subscriptionPrice,
              bunnyLibraryId: tenant.bunnyLibraryId,
              bunnyApiKey: tenant.bunnyApiKey,
              midtransClientKey: tenant.midtransClientKey,
              midtransServerKey: tenant.midtransServerKey,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
