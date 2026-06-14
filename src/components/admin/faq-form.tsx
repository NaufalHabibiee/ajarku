"use client";

import { useRef } from "react";
import { useFormState } from "react-dom";
import { createFAQ, type ActionState } from "@/lib/actions/faq";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

const initial: ActionState = {};

export function FaqForm() {
  const [state, action] = useFormState(createFAQ, initial);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-4"
      key={state.success}
    >
      <FormToast state={state} />
      <div className="space-y-2">
        <Label htmlFor="question">Pertanyaan</Label>
        <Input id="question" name="question" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="answer">Jawaban</Label>
        <Textarea id="answer" name="answer" rows={3} required />
      </div>
      <SubmitButton variant="brand">Tambah FAQ</SubmitButton>
    </form>
  );
}
