"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireAdminContext } from "@/lib/admin";

export type ActionState = { error?: string; success?: string };

function isInstructor(role: string) {
  return role === "admin" || role === "superadmin";
}

export async function createThread(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const lessonId = String(formData.get("lessonId") ?? "").trim() || null;

  if (!title || !body) return { error: "Title and message are required." };

  // If a lesson is linked, make sure it belongs to this tenant.
  if (lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson || lesson.module.course.tenantId !== user.tenantId) {
      return { error: "Invalid lesson." };
    }
  }

  const thread = await prisma.forumThread.create({
    data: {
      tenantId: user.tenantId,
      userId: user.id,
      lessonId,
      title,
      body,
    },
  });

  revalidatePath("/community");
  redirect(`/community/${thread.id}`);
}

export async function createReply(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Reply cannot be empty." };

  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
  });
  if (!thread || thread.tenantId !== user.tenantId) {
    return { error: "Thread not found." };
  }

  await prisma.forumReply.create({
    data: {
      threadId,
      userId: user.id,
      body,
      isInstructorReply: isInstructor(user.role),
    },
  });
  await prisma.forumThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/community/${threadId}`);
  return { success: "Reply posted." };
}

export async function upvoteReply(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const reply = await prisma.forumReply.findUnique({
    where: { id },
    include: { thread: true },
  });
  if (!reply || reply.thread.tenantId !== user.tenantId) return;

  await prisma.forumReply.update({
    where: { id },
    data: { upvotes: { increment: 1 } },
  });
  revalidatePath(`/community/${reply.threadId}`);
}

// ---- Admin moderation ----

export async function togglePinThread(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const thread = await prisma.forumThread.findUnique({ where: { id } });
  if (!thread || thread.tenantId !== tenant.id) return;
  await prisma.forumThread.update({
    where: { id },
    data: { isPinned: !thread.isPinned },
  });
  revalidatePath("/community");
  revalidatePath(`/community/${id}`);
}

export async function deleteThread(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const thread = await prisma.forumThread.findUnique({ where: { id } });
  if (!thread || thread.tenantId !== tenant.id) return;
  await prisma.forumThread.delete({ where: { id } });
  revalidatePath("/community");
  redirect("/community");
}
