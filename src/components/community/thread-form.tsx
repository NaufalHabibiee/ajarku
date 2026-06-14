"use client";

import { useFormState } from "react-dom";
import { createThread, type ActionState } from "@/lib/actions/forum";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

const initial: ActionState = {};

export function ThreadForm({ lessonId }: { lessonId?: string }) {
  const [state, action] = useFormState(createThread, initial);

  return (
    <form action={action} className="space-y-4">
      <FormToast state={state} />
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {lessonId && <input type="hidden" name="lessonId" value={lessonId} />}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="What's your question?" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Details</Label>
        <Textarea id="body" name="body" rows={5} required />
      </div>
      <SubmitButton variant="brand">Post thread</SubmitButton>
    </form>
  );
}
