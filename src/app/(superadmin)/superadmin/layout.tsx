import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { SuperAdminNav } from "@/components/superadmin/superadmin-nav";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "superadmin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/superadmin" className="flex items-center gap-2 font-bold">
            Platform Console
            <Badge variant="brand">Super Admin</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton variant="outline" size="sm" />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r bg-background p-4 md:block">
          <SuperAdminNav />
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <nav className="sticky bottom-0 z-40 border-t bg-background md:hidden">
        <div className="overflow-x-auto px-2 py-2">
          <SuperAdminNav />
        </div>
      </nav>
    </div>
  );
}
