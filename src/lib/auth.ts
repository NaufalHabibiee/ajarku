import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import type { Tenant, User } from "@prisma/client";

export type CurrentUser = User & { tenant: Tenant };

/**
 * Resolve the current application user for the active tenant.
 *
 * Bridges the Supabase Auth session to our tenant-scoped `User` table. If the
 * authenticated Supabase user has no `User` row for this tenant yet (e.g. first
 * login via magic link), one is provisioned on the fly.
 *
 * Returns null when there is no session or no tenant.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const tenant = await getTenant();
  if (!tenant) return null;

  let user = await prisma.user.findUnique({
    where: { tenantId_authId: { tenantId: tenant.id, authId: authUser.id } },
  });

  // Provision a User row on first sight (also links a pre-created row by email).
  if (!user) {
    const email = authUser.email ?? "";
    const name =
      (authUser.user_metadata?.name as string | undefined) ?? null;

    user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: { authId: authUser.id },
      create: {
        tenantId: tenant.id,
        authId: authUser.id,
        email,
        name,
        role: "student",
      },
    });
  }

  return { ...user, tenant };
});

/** Whether the user currently has an active (non-expired) subscription. */
export function hasActiveSubscription(user: Pick<User, "isSubscribed" | "subscriptionExpiry">): boolean {
  if (!user.isSubscribed) return false;
  if (!user.subscriptionExpiry) return false;
  return user.subscriptionExpiry.getTime() > Date.now();
}

/** Throwing variant for protected server code. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

/** Require an admin (or superadmin) for the current tenant. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new Error("Forbidden");
  }
  return user;
}
