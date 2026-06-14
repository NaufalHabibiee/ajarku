"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function markAllNotificationsRead(): Promise<void> {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}

/** Mark one notification read, then follow its link (used by bell rows). */
export async function openNotification(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (notification && notification.userId === user.id) {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
  revalidatePath("/", "layout");
  redirect(notification?.link ?? "/dashboard");
}

/** Mark the notification tied to an announcement read (announcements widget). */
export async function markAnnouncementRead(formData: FormData): Promise<void> {
  const user = await requireUser();
  const announcementId = String(formData.get("announcementId") ?? "");
  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      type: "announcement",
      refId: announcementId,
      isRead: false,
    },
    data: { isRead: true },
  });
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
}
