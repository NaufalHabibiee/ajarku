"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type AchievementItem = {
  key: string;
  emoji: string;
  title: string;
  description: string;
  howTo: string;
  earned: boolean;
};

export function AchievementsRow({ items }: { items: AchievementItem[] }) {
  const earnedCount = items.filter((i) => i.earned).length;
  const [selected, setSelected] = useState<AchievementItem | null>(
    items.find((i) => i.earned) ?? items[0] ?? null
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {earnedCount} dari {items.length} lencana diraih
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSelected(item)}
            title={item.earned ? item.title : `Terkunci — ${item.howTo}`}
            className={cn(
              "relative flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border transition-all",
              item.earned
                ? "border-brand/40 bg-brand/5 hover:bg-brand/10"
                : "border-dashed bg-muted/40 opacity-60 grayscale",
              selected?.key === item.key && "ring-2 ring-brand ring-offset-2 ring-offset-background"
            )}
          >
            <span className="text-2xl leading-none">{item.emoji}</span>
            {!item.earned && (
              <span className="absolute bottom-1 right-1 rounded-full bg-background p-0.5">
                <Lock className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span>{selected.emoji}</span>
            {selected.title}
            {selected.earned ? (
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                Diraih
              </span>
            ) : (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Terkunci
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {selected.description}{" "}
            {!selected.earned && (
              <span className="text-foreground">Cara meraih: {selected.howTo}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
