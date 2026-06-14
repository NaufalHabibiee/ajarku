"use client";

import { useFormState } from "react-dom";
import { createReply, type ActionState } from "@/lib/actions/forum";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

const initial: ActionState = {};

export function ReplyForm({ threadId }: { threadId: string }) {
  const [state, action] = useFormState(createReply, initial);

  return (
    <form action={action} className="space-y-3" key={state.success}>
      <FormToast state={state} />
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <input type="hidden" name="threadId" value={threadId} />
      <Textarea name="body" rows={3} placeholder="Write a reply…" required />
      <SubmitButton variant="brand">Reply</SubmitButton>
    </form>
  );
}
