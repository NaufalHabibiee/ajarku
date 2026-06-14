import { getCurrentUser } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import type { Tenant } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth";

/** Resolve the current admin user + tenant, or throw if not authorized. */
export async function requireAdminContext(): Promise<{
  user: CurrentUser;
  tenant: Tenant;
}> {
  const user = await getCurrentUser();
  const tenant = await getTenant();
  if (!user || !tenant) throw new Error("Not authenticated");
  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new Error("Forbidden");
  }
  // Defensive: the admin must belong to the tenant they're managing.
  if (user.tenantId !== tenant.id) throw new Error("Forbidden");
  return { user, tenant };
}

/** Resolve the current user and require the superadmin (platform owner) role. */
export async function requireSuperAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "superadmin") throw new Error("Forbidden");
  return user;
}

/** Get the tenant's course, creating an empty draft if none exists. */
export async function getOrCreateCourse(tenantId: string) {
  const existing = await prisma.course.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  return prisma.course.create({
    data: {
      tenantId,
      title: "Untitled Course",
      description: "",
      isPublished: false,
    },
  });
}

/** Assert a module belongs to the tenant; returns it or throws. */
export async function assertModuleInTenant(moduleId: string, tenantId: string) {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!mod || mod.course.tenantId !== tenantId) {
    throw new Error("Module not found");
  }
  return mod;
}

/** Assert a lesson belongs to the tenant; returns it or throws. */
export async function assertLessonInTenant(lessonId: string, tenantId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson || lesson.module.course.tenantId !== tenantId) {
    throw new Error("Lesson not found");
  }
  return lesson;
}
