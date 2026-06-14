"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin";

export type ActionState = { error?: string; success?: string };

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;
const RESERVED = new Set(["www", "app", "admin", "api", "superadmin", "auth"]);

function clean(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export async function createTenant(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSuperAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const customDomain = clean(formData, "customDomain");
  const adminEmail = clean(formData, "adminEmail")?.toLowerCase() ?? null;
  const priceRaw = String(formData.get("subscriptionPrice") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (!SLUG_RE.test(slug) || RESERVED.has(slug)) {
    return { error: "Slug must be 2–32 chars, lowercase letters/numbers/dashes, and not reserved." };
  }

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) return { error: "That slug is already taken." };

  const subscriptionPrice = priceRaw ? parseInt(priceRaw, 10) : 99000;
  if (Number.isNaN(subscriptionPrice) || subscriptionPrice < 0) {
    return { error: "Price must be a positive number." };
  }

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      customDomain,
      subscriptionPrice,
      subscriptionStatus: "active",
      bunnyLibraryId: clean(formData, "bunnyLibraryId"),
      bunnyApiKey: clean(formData, "bunnyApiKey"),
      midtransClientKey: clean(formData, "midtransClientKey"),
      midtransServerKey: clean(formData, "midtransServerKey"),
    },
  });

  // Pre-create an admin user row; it links to a Supabase account by email on
  // first login (role is preserved as admin).
  if (adminEmail) {
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: adminEmail,
        role: "admin",
      },
    });
  }

  revalidatePath("/superadmin");
  redirect(`/superadmin/tenants/${tenant.id}`);
}

export async function updateTenant(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return { error: "Tenant not found." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const customDomain = clean(formData, "customDomain");
  if (customDomain) {
    const clash = await prisma.tenant.findFirst({
      where: { customDomain, id: { not: id } },
    });
    if (clash) return { error: "That custom domain is already in use." };
  }

  const priceRaw = String(formData.get("subscriptionPrice") ?? "").trim();
  const subscriptionPrice = priceRaw
    ? parseInt(priceRaw, 10)
    : tenant.subscriptionPrice;

  await prisma.tenant.update({
    where: { id },
    data: {
      name,
      customDomain,
      subscriptionPrice,
      bunnyLibraryId: clean(formData, "bunnyLibraryId"),
      bunnyApiKey: clean(formData, "bunnyApiKey"),
      midtransClientKey: clean(formData, "midtransClientKey"),
      midtransServerKey: clean(formData, "midtransServerKey"),
    },
  });

  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/tenants/${id}`);
  return { success: "Tenant updated." };
}

export async function toggleTenantStatus(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return;
  await prisma.tenant.update({
    where: { id },
    data: {
      subscriptionStatus:
        tenant.subscriptionStatus === "active" ? "inactive" : "active",
    },
  });
  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/tenants/${id}`);
}
