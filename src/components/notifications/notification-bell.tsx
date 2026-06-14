"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Megaphone,
  MessageSquare,
  Radio,
  Flame,
  Unlock,
  Trophy,
  CheckCheck,
} from "lucide-react";
import {
  openNotification,
  markAllNotificationsRead,
} from "@/lib/actions/notifications";
import { relativeTimeID } from "@/lib/time";
import { cn } from "@/lib/utils";

export type BellNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

const ICONS: Record<string, React.ElementType> = {
  announcement: Megaphone,
  forum_reply: MessageSquare,
  live_soon: Radio,
  streak_risk: Flame,
  lesson_unlocked: Unlock,
  achievement: Trophy,
};

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: BellNotification[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifikasi"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Notifikasi</span>
            {unreadCount > 0 && (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Tandai semua
                </button>
              </form>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Belum ada notifikasi.
              </p>
            ) : (
              <ul className="divide-y">
                {notifications.map((n) => {
                  const Icon = ICONS[n.type] ?? Bell;
                  return (
                    <li key={n.id}>
                      <form action={openNotification}>
                        <input type="hidden" name="id" value={n.id} />
                        <button
                          type="submit"
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                            !n.isRead && "bg-brand/5"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                              n.isRead
                                ? "bg-muted text-muted-foreground"
                                : "bg-brand/15 text-brand"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                              )}
                            </span>
                            <span className="line-clamp-2 text-xs text-muted-foreground">
                              {n.body}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {relativeTimeID(new Date(n.createdAt))}
                            </span>
                          </span>
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
