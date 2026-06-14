"use client";

import { useFormState } from "react-dom";
import { createLiveSession, type ActionState } from "@/lib/actions/live";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

const initial: ActionState = {};

export function LiveForm() {
  const [state, action] = useFormState(createLiveSession, initial);

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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Date &amp; time</Label>
          <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="meetUrl">Meeting link (Zoom / Google Meet)</Label>
        <Input id="meetUrl" name="meetUrl" type="url" placeholder="https://…" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <SubmitButton variant="brand">Schedule session</SubmitButton>
    </form>
  );
}
