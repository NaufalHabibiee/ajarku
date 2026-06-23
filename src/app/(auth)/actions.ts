"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  magicLinkSchema,
} from "@/lib/validations/auth";

export type AuthState = { error?: string; success?: string };

function firstError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Input tidak valid.";
}

function getOrigin(host: string | null): string {
  const proto =
    process.env.NODE_ENV === "production" ? "https" : "http";
  return `${proto}://${host ?? "localhost:3000"}`;
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const next = String(formData.get("next") ?? "/dashboard");

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next || "/dashboard");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { name, email, password } = parsed.data;

  const host = (await headers()).get("host");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${getOrigin(host)}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: error.message };

  // If email confirmation is disabled, a session is returned immediately.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    success:
      "Check your email to confirm your account, then sign in.",
  };
}

export async function signInWithMagicLink(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { email } = parsed.data;

  const host = (await headers()).get("host");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getOrigin(host)}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: error.message };

  return { success: "We sent you a magic link. Check your inbox." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
