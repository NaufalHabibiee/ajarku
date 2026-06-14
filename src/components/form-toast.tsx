"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type State = { error?: string; success?: string };

/**
 * Fires a toast whenever a server-action form state changes to a new
 * error/success message. Drop into any client form that uses useFormState.
 */
export function FormToast({ state }: { state: State }) {
  const last = useRef<string | null>(null);

  useEffect(() => {
    const msg = state.error ?? state.success;
    if (!msg || msg === last.current) return;
    last.current = msg;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success(state.success);
  }, [state]);

  return null;
}
