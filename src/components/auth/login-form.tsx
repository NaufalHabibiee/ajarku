"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { signIn, signInWithMagicLink, type AuthState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSubmit } from "./auth-submit";
import { FormToast } from "@/components/form-toast";

const initial: AuthState = {};

export function LoginForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction] = useFormState(signIn, initial);
  const [magicState, magicAction] = useFormState(signInWithMagicLink, initial);

  const state = mode === "password" ? pwState : magicState;

  return (
    <div className="space-y-4">
      <FormToast state={state} />
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
          {state.success}
        </p>
      )}

      {mode === "password" ? (
        <form action={pwAction} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/dashboard"} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <AuthSubmit variant="brand" className="w-full">
            Sign in
          </AuthSubmit>
          <button
            type="button"
            onClick={() => setMode("magic")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Sign in with a magic link instead
          </button>
        </form>
      ) : (
        <form action={magicAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email">Email</Label>
            <Input
              id="magic-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <AuthSubmit variant="brand" className="w-full">
            Send magic link
          </AuthSubmit>
          <button
            type="button"
            onClick={() => setMode("password")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Use password instead
          </button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
