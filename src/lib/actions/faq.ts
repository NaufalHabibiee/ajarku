"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/admin";

export type ActionState = { error?: string; success?: string };

async function assertFaqInTenant(id: string, tenantId: string) {
  const faq = await prisma.fAQ.findUnique({ where: { id } });
  if (!faq || faq.tenantId !== tenantId) throw new Error("FAQ not found");
  return faq;
}

export async function createFAQ(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { tenant } = await requireAdminContext();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) {
    return { error: "Pertanyaan dan jawaban wajib diisi." };
  }
  const count = await prisma.fAQ.count({ where: { tenantId: tenant.id } });
  await prisma.fAQ.create({
    data: { tenantId: tenant.id, question, answer, order: count },
  });
  revalidatePath("/admin/faq");
  revalidatePath("/dashboard");
  return { success: "FAQ ditambahkan." };
}

export async function updateFAQ(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  await assertFaqInTenant(id, tenant.id);
  if (question && answer) {
    await prisma.fAQ.update({ where: { id }, data: { question, answer } });
  }
  revalidatePath("/admin/faq");
  revalidatePath("/dashboard");
}

export async function deleteFAQ(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  await assertFaqInTenant(id, tenant.id);
  await prisma.fAQ.delete({ where: { id } });
  revalidatePath("/admin/faq");
  revalidatePath("/dashboard");
}

export async function moveFAQ(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  await assertFaqInTenant(id, tenant.id);

  const all = await prisma.fAQ.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: "asc" },
  });
  const idx = all.findIndex((f) => f.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx];
  const b = all[swapIdx];
  await prisma.$transaction([
    prisma.fAQ.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.fAQ.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  revalidatePath("/admin/faq");
  revalidatePath("/dashboard");
}
