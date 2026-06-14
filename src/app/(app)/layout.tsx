import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications, getUnreadCount } from "@/lib/notifications";
import { TenantBranding } from "@/components/tenant-branding";
import { DashboardChrome } from "@/components/app/dashboard-chrome";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id),
    getUnreadCount(user.id),
  ]);

  return (
    <>
      <TenantBranding tenant={tenant} />
      <DashboardChrome
        user={{ name: user.name, email: user.email, role: user.role }}
        notifications={notifications}
        unreadCount={unreadCount}
      >
        {children}
      </DashboardChrome>
    </>
  );
}
