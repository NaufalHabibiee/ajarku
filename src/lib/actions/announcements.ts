"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/admin";

export type ActionState = { error?: string; success?: string };

export async function createAnnouncement(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { tenant } = await requireAdminContext();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return { error: "Title and message are required." };

  await prisma.announcement.create({
    data: { tenantId: tenant.id, title, body },
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  return { success: "Announcement posted." };
}

export async function deleteAnnouncement(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const a = await prisma.announcement.findUnique({ where: { id } });
  if (!a || a.tenantId !== tenant.id) throw new Error("Not found");
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin/announcements");
}
