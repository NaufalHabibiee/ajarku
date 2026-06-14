import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTenant } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth";
import { TenantBranding } from "@/components/tenant-branding";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "admin" && user.role !== "superadmin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TenantBranding tenant={tenant} />

      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-brand text-sm font-bold text-brand-foreground">
                {tenant?.name?.charAt(0) ?? "A"}
              </span>
              <span className="hidden sm:inline">{tenant?.name}</span>
            </Link>
            <Badge variant="outline">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Student view
              </Link>
            </Button>
            <ThemeToggle />
            <LogoutButton variant="outline" size="sm" />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r p-4 md:block">
          <AdminNav />
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <nav className="sticky bottom-0 z-40 border-t bg-background md:hidden">
        <div className="overflow-x-auto px-2 py-2">
          <AdminNav />
        </div>
      </nav>
    </div>
  );
}
