"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";

export type CourseCardItem = {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  pct: number;
};

export function LastOpenedCarousel({ items }: { items: CourseCardItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    ref.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="Sebelumnya"
        onClick={() => scroll(-1)}
        className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-1.5 opacity-0 shadow transition-opacity hover:bg-muted group-hover:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Berikutnya"
        onClick={() => scroll(1)}
        className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-1.5 opacity-0 shadow transition-opacity hover:bg-muted group-hover:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div
        ref={ref}
        className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/learn/${item.id}`}
            className="w-64 shrink-0 snap-start overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-ajar-teal/20 to-ajar-indigo/20">
              <PlayCircle className="h-10 w-10 text-ajar-teal/70" />
            </div>
            <div className="space-y-2 p-4">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.subtitle} • {item.instructor}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ajar-teal to-ajar-indigo"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">{item.pct}% selesai</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
