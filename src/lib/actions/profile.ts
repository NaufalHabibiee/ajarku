"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: string };

export async function updateProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;

  if (!name) return { error: "Name is required." };

  await prisma.user.update({
    where: { id: user.id },
    data: { name, avatarUrl },
  });

  // Keep Supabase metadata roughly in sync (best-effort).
  try {
    const supabase = await createClient();
    await supabase.auth.updateUser({ data: { name } });
  } catch {
    /* ignore */
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}

export async function changePassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: "Password changed." };
}
