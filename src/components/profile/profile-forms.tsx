"use client";

import { useFormState } from "react-dom";
import {
  updateProfile,
  changePassword,
  type ActionState,
} from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

const initial: ActionState = {};

function Notice({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
        {state.success}
      </p>
    );
  return null;
}

export function ProfileForm({
  name,
  avatarUrl,
  email,
}: {
  name: string;
  avatarUrl: string;
  email: string;
}) {
  const [state, action] = useFormState(updateProfile, initial);
  return (
    <form action={action} className="space-y-4">
      <Notice state={state} />
      <FormToast state={state} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={avatarUrl}
          placeholder="https://…"
        />
      </div>
      <SubmitButton variant="brand">Save profile</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useFormState(changePassword, initial);
  return (
    <form action={action} className="space-y-4" key={state.success}>
      <Notice state={state} />
      <FormToast state={state} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <SubmitButton variant="brand">Change password</SubmitButton>
    </form>
  );
}
