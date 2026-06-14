"use client";

import { useFormState } from "react-dom";
import { createAnnouncement, type ActionState } from "@/lib/actions/announcements";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

const initial: ActionState = {};

export function AnnouncementForm() {
  const [state, action] = useFormState(createAnnouncement, initial);

  return (
    <form action={action} className="space-y-4">
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
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Message</Label>
        <Textarea id="body" name="body" rows={3} required />
      </div>
      <SubmitButton variant="brand">Post announcement</SubmitButton>
    </form>
  );
}
