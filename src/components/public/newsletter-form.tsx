"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Masukkan email yang valid.");
      return;
    }
    setDone(true);
    setEmail("");
    toast.success("Berhasil! Kamu akan menerima update terbaru. 🎉");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@kamu.com"
          aria-label="Email"
          className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ajar-teal"
        />
        <button
          type="submit"
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-ajar-teal px-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-ajar-teal/90 hover:shadow-[0_0_14px_rgba(20,184,166,0.5)]"
        >
          <Send className="h-4 w-4" /> Subscribe
        </button>
      </div>
      {done && (
        <p className="animate-fade-up text-xs text-ajar-teal">
          ✓ Terima kasih sudah berlangganan!
        </p>
      )}
    </form>
  );
}
