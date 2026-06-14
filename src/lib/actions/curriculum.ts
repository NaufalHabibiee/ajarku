"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  requireAdminContext,
  getOrCreateCourse,
  assertModuleInTenant,
  assertLessonInTenant,
} from "@/lib/admin";

const MAX_FREE_LESSONS = 2;

export type ActionState = { error?: string; success?: string };

// ---------------------------------------------------------------- Course

export async function updateCourseDetails(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { tenant } = await requireAdminContext();
  const course = await getOrCreateCourse(tenant.id);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return { error: "Title is required." };

  await prisma.course.update({
    where: { id: course.id },
    data: { title, description },
  });
  revalidatePath("/admin/curriculum");
  return { success: "Course updated." };
}

export async function togglePublish(): Promise<void> {
  const { tenant } = await requireAdminContext();
  const course = await getOrCreateCourse(tenant.id);
  await prisma.course.update({
    where: { id: course.id },
    data: { isPublished: !course.isPublished },
  });
  revalidatePath("/admin/curriculum");
}

// ---------------------------------------------------------------- Modules

export async function createModule(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const course = await getOrCreateCourse(tenant.id);
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const count = await prisma.module.count({ where: { courseId: course.id } });
  await prisma.module.create({
    data: { courseId: course.id, title, order: count },
  });
  revalidatePath("/admin/curriculum");
}

export async function renameModule(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  await assertModuleInTenant(id, tenant.id);
  if (title) await prisma.module.update({ where: { id }, data: { title } });
  revalidatePath("/admin/curriculum");
}

export async function deleteModule(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  await assertModuleInTenant(id, tenant.id);
  await prisma.module.delete({ where: { id } });
  revalidatePath("/admin/curriculum");
}

export async function moveModule(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  const mod = await assertModuleInTenant(id, tenant.id);

  const siblings = await prisma.module.findMany({
    where: { courseId: mod.courseId },
    orderBy: { order: "asc" },
  });
  const idx = siblings.findIndex((m) => m.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;

  const other = siblings[swapIdx];
  await prisma.$transaction([
    prisma.module.update({ where: { id: mod.id }, data: { order: other.order } }),
    prisma.module.update({ where: { id: other.id }, data: { order: mod.order } }),
  ]);
  revalidatePath("/admin/curriculum");
}

// ---------------------------------------------------------------- Lessons

export async function createLessonQuick(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const moduleId = String(formData.get("moduleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  await assertModuleInTenant(moduleId, tenant.id);
  if (!title) return;
  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: { moduleId, title, order: count },
  });
  revalidatePath("/admin/curriculum");
}

export async function deleteLesson(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  await assertLessonInTenant(id, tenant.id);
  await prisma.lesson.delete({ where: { id } });
  revalidatePath("/admin/curriculum");
}

export async function moveLesson(formData: FormData): Promise<void> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "");
  const lesson = await assertLessonInTenant(id, tenant.id);

  const siblings = await prisma.lesson.findMany({
    where: { moduleId: lesson.moduleId },
    orderBy: { order: "asc" },
  });
  const idx = siblings.findIndex((l) => l.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;

  const other = siblings[swapIdx];
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lesson.id }, data: { order: other.order } }),
    prisma.lesson.update({ where: { id: other.id }, data: { order: lesson.order } }),
  ]);
  revalidatePath("/admin/curriculum");
}

// Full lesson upsert (used by the lesson editor form).
export async function saveLesson(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { tenant } = await requireAdminContext();
  const id = String(formData.get("id") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const videoId = String(formData.get("videoId") ?? "").trim() || null;
  const videoDurationRaw = String(formData.get("videoDuration") ?? "").trim();
  const videoDuration = videoDurationRaw ? parseInt(videoDurationRaw, 10) : null;
  const isFree = formData.get("isFree") === "on";

  // Attachments come as parallel name[]/url[] arrays.
  const names = formData.getAll("attachmentName").map(String);
  const urls = formData.getAll("attachmentUrl").map(String);
  const attachments = names
    .map((name, i) => ({ name: name.trim(), url: (urls[i] ?? "").trim() }))
    .filter((a) => a.name && a.url);

  if (!title) return { error: "Title is required." };
  if (!moduleId) return { error: "Please choose a module." };
  await assertModuleInTenant(moduleId, tenant.id);

  // Enforce a maximum of 2 free lessons per course.
  if (isFree) {
    const course = await getOrCreateCourse(tenant.id);
    const freeCount = await prisma.lesson.count({
      where: {
        isFree: true,
        module: { courseId: course.id },
        ...(id ? { id: { not: id } } : {}),
      },
    });
    if (freeCount >= MAX_FREE_LESSONS) {
      return {
        error: `You can only have ${MAX_FREE_LESSONS} free lessons. Unmark another first.`,
      };
    }
  }

  if (id) {
    await assertLessonInTenant(id, tenant.id);
    await prisma.lesson.update({
      where: { id },
      data: {
        moduleId,
        title,
        description,
        videoId,
        videoDuration,
        isFree,
        attachments,
      },
    });
  } else {
    const count = await prisma.lesson.count({ where: { moduleId } });
    await prisma.lesson.create({
      data: {
        moduleId,
        title,
        description,
        videoId,
        videoDuration,
        isFree,
        attachments,
        order: count,
      },
    });
  }

  revalidatePath("/admin/curriculum");
  redirect("/admin/curriculum");
}
