"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/admin";

export type ActionState = { error?: string; success?: string };

const HEX = /^#[0-9a-fA-F]{6}$/;

export async function updateBranding(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { tenant } = await requireAdminContext();

  const name = String(formData.get("name") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
  const primaryColor = String(formData.get("primaryColor") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "").trim();
  const priceRaw = String(formData.get("subscriptionPrice") ?? "").trim();

  if (!name) return { error: "Course/brand name is required." };
  if (primaryColor && !HEX.test(primaryColor)) {
    return { error: "Primary color must be a hex value like #4f46e5." };
  }
  if (accentColor && !HEX.test(accentColor)) {
    return { error: "Accent color must be a hex value like #22d3ee." };
  }
  const subscriptionPrice = priceRaw ? parseInt(priceRaw, 10) : tenant.subscriptionPrice;
  if (Number.isNaN(subscriptionPrice) || subscriptionPrice < 0) {
    return { error: "Price must be a positive number." };
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      name,
      logoUrl,
      primaryColor: primaryColor || tenant.primaryColor,
      accentColor: accentColor || tenant.accentColor,
      subscriptionPrice,
    },
  });
  revalidatePath("/", "layout");
  return { success: "Branding saved." };
}

export async function updateIntegrations(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { tenant } = await requireAdminContext();

  // Empty string clears the override (falls back to platform default).
  const clean = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      bunnyLibraryId: clean("bunnyLibraryId"),
      bunnyApiKey: clean("bunnyApiKey"),
      midtransClientKey: clean("midtransClientKey"),
      midtransServerKey: clean("midtransServerKey"),
    },
  });
  revalidatePath("/admin/settings");
  return { success: "Integration keys saved." };
}
