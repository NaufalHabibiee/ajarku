"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { markAnnouncementRead } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
  unread: boolean;
};

export function AnnouncementsList({ items }: { items: AnnouncementItem[] }) {
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const visible = showAll ? items : items.slice(0, 3);

  function toggle(item: AnnouncementItem) {
    setOpenId((cur) => (cur === item.id ? null : item.id));
    if (item.unread && !readIds.has(item.id)) {
      setReadIds((prev) => new Set(prev).add(item.id));
      const fd = new FormData();
      fd.set("announcementId", item.id);
      startTransition(() => markAnnouncementRead(fd));
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Belum ada pengumuman.</p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {visible.map((a) => {
          const unread = a.unread && !readIds.has(a.id);
          const open = openId === a.id;
          return (
            <li
              key={a.id}
              className="rounded-lg border-l-2 border-brand bg-muted/30"
            >
              <button
                type="button"
                onClick={() => toggle(a)}
                className="flex w-full items-start gap-2 px-4 py-3 text-left"
              >
                {unread && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("font-medium", unread && "text-foreground")}>
                      {a.title}
                    </span>
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {a.timeAgo}
                  </span>
                  {open && (
                    <span className="mt-2 block text-sm text-muted-foreground">
                      {a.body}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180"
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>

      {items.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-sm font-medium text-brand hover:underline"
        >
          {showAll ? "Tampilkan lebih sedikit" : "Lihat semua"}
        </button>
      )}
    </div>
  );
}
