"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/admin";

export type ActionState = { error?: string; success?: string };

async function assertSessionInTenant(id: string, tenantId: string) {
  const s = await prisma.liveSession.findUnique({ where: { id } });
  if (!s || s.tenantId !== tenantId) throw new Error("Session not found");
  return s;
}

export async function createLiveSession(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { tenant } = await requireAdminContext();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const scheduledAt = String(formData.get("scheduledAt") ?? "");
  const meetUrl = String(formData.get("meetUrl") ?? "").trim() || null;

  if (!title || !scheduledAt) {
    return { error: "Title and date/time are required." };
  }
  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime())) return { error: "Invalid date." };

  await prisma.liveSession.create({
    data: { tenantId: tenant.id, title, description, scheduledAt: when, meetUrl },
  });
  revalidatePath("/admin/live");
  return { success: "Live session scheduled." };
}

export async function setRecordingUrl(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const recordingUrl = String(formData.get("recordingUrl") ?? "").trim() || null;
  await assertSessionInTenant(id, tenant.id);
  await prisma.liveSession.update({ where: { id }, data: { recordingUrl } });
  revalidatePath("/admin/live");
}

export async function deleteLiveSession(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  await assertSessionInTenant(id, tenant.id);
  await prisma.liveSession.delete({ where: { id } });
  revalidatePath("/admin/live");
}
