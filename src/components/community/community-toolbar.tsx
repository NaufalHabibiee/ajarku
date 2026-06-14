"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  FILTERS,
  SORTS,
  type ThreadFilter,
  type ThreadSort,
} from "@/lib/community-constants";
import { cn } from "@/lib/utils";

export function CommunityToolbar({
  filter,
  sort,
  q,
}: {
  filter: ThreadFilter;
  sort: ThreadSort;
  q: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(q);

  function navigate(next: Partial<{ filter: string; sort: string; q: string }>) {
    const params = new URLSearchParams();
    const f = next.filter ?? filter;
    const s = next.sort ?? sort;
    const query = next.q ?? search;
    if (f && f !== "all") params.set("filter", f);
    if (s && s !== "recent") params.set("sort", s);
    if (query) params.set("q", query);
    const qs = params.toString();
    router.push(qs ? `/community?${qs}` : "/community");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ q: search });
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari diskusi…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ajar-teal"
          />
        </form>

        <select
          value={sort}
          onChange={(e) => navigate({ sort: e.target.value })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ajar-teal"
          aria-label="Urutkan"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => navigate({ filter: f.key })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.key
                ? "border-ajar-teal bg-ajar-teal text-white"
                : "text-muted-foreground hover:border-ajar-teal/40 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
