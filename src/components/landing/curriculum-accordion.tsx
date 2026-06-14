"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Lock, PlayCircle } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CurriculumModule = {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    isFree: boolean;
    videoDuration: number | null;
  }[];
};

export function CurriculumAccordion({
  modules,
  completedLessonIds,
  isLoggedIn,
}: {
  modules: CurriculumModule[];
  completedLessonIds: string[];
  isLoggedIn: boolean;
}) {
  const completed = new Set(completedLessonIds);
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(modules.slice(0, 1).map((m) => m.id))
  );

  const allOpen = openIds.size === modules.length;

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setOpenIds(allOpen ? new Set() : new Set(modules.map((m) => m.id)));
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm font-medium text-ajar-teal hover:underline"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="space-y-3">
        {modules.map((module, mi) => {
          const open = openIds.has(module.id);
          const total = module.lessons.length;
          const done = module.lessons.filter((l) => completed.has(l.id)).length;
          return (
            <div
              key={module.id}
              className={cn(
                "overflow-hidden rounded-xl border transition-colors",
                open ? "border-ajar-teal/40 bg-ajar-teal/[0.03]" : "hover:border-ajar-teal/30 hover:bg-muted/40"
              )}
            >
              <button
                type="button"
                onClick={() => toggle(module.id)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ajar-teal/10 text-xs font-bold text-ajar-teal">
                  {String(mi + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="font-medium">{module.title}</span>
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {total} lessons
                  </span>
                </span>
                {isLoggedIn && (
                  <span className="hidden shrink-0 text-xs font-medium text-muted-foreground sm:inline">
                    {done}/{total} completed
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                    open && "rotate-180"
                  )}
                />
              </button>

              {/* Smooth height animation via grid-rows trick */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-0.5 px-3 pb-3">
                    {module.lessons.map((lesson) => {
                      const isDone = completed.has(lesson.id);
                      const row = (
                        <div
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                            lesson.isFree ? "hover:bg-ajar-teal/10" : "hover:bg-muted"
                          )}
                        >
                          {lesson.isFree ? (
                            <PlayCircle className="h-4 w-4 text-ajar-teal transition-transform group-hover:scale-125" />
                          ) : isDone ? (
                            <PlayCircle className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.isFree && (
                            <span className="rounded-full bg-ajar-teal px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_0_10px_rgba(20,184,166,0.5)]">
                              Free
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(lesson.videoDuration)}
                          </span>
                        </div>
                      );
                      return (
                        <li key={lesson.id}>
                          {lesson.isFree ? (
                            <Link href={`/preview/${lesson.id}`} className="block">
                              {row}
                            </Link>
                          ) : (
                            row
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
