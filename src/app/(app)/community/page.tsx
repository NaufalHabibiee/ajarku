import Link from "next/link";
import {
  MessageSquare,
  Eye,
  CheckCircle2,
  Pin,
  Plus,
  Trophy,
  Lightbulb,
  MessagesSquare,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildThreadWhere,
  buildThreadOrderBy,
  getTopContributors,
  getPinnedThreads,
} from "@/lib/community";
import type { ThreadFilter, ThreadSort } from "@/lib/community-constants";
import { relativeTimeID } from "@/lib/time";
import { avatarColor, initials } from "@/lib/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommunityToolbar } from "@/components/community/community-toolbar";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Komunitas" };

const PAGE_SIZE = 12;
const VALID_FILTERS = ["all", "mine", "replied", "answered", "unanswered"];
const VALID_SORTS = ["recent", "most_replies", "trending", "trending_week"];

const TIPS = [
  "Cari jawaban sebelum bertanya",
  "Gunakan judul yang deskriptif",
  "Hormati anggota komunitas",
  "Instruktur akan membalas dalam 24 jam",
];

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string; sort?: string; page?: string };
}) {
  const user = await requireUser();
  const q = (searchParams.q ?? "").trim();
  const filter = (VALID_FILTERS.includes(searchParams.filter ?? "")
    ? searchParams.filter
    : "all") as ThreadFilter;
  const sort = (VALID_SORTS.includes(searchParams.sort ?? "")
    ? searchParams.sort
    : "recent") as ThreadSort;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where = buildThreadWhere(filter, sort, user.tenantId, user.id, q);
  const orderBy = buildThreadOrderBy(sort);

  const [threads, total, pinned, contributors] = await Promise.all([
    prisma.forumThread.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { replies: true } },
        replies: { where: { isInstructorReply: true }, take: 1, select: { id: true } },
      },
    }),
    prisma.forumThread.count({ where }),
    getPinnedThreads(user.tenantId),
    getTopContributors(user.tenantId),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filter !== "all") params.set("filter", filter);
    if (sort !== "recent") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/community?${qs}` : "/community";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <nav className="text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Home
          </Link>{" "}
          <span className="mx-1">›</span> <span className="text-foreground">Komunitas</span>
        </nav>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-bold">Komunitas</h1>
            <p className="text-muted-foreground">
              Diskusi, tanya jawab, dan kolaborasi dengan sesama pelajar
            </p>
          </div>
          <Button asChild className="bg-ajar-teal text-white hover:bg-ajar-teal/90">
            <Link href="/community/new">
              <Plus className="mr-2 h-4 w-4" /> Buat Diskusi Baru
            </Link>
          </Button>
        </div>
        <CommunityToolbar filter={filter} sort={sort} q={q} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main thread list */}
        <div className="space-y-3 lg:col-span-2">
          {threads.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <MessagesSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium">
                {q || filter !== "all"
                  ? "Tidak ada diskusi yang cocok."
                  : "Belum ada diskusi."}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Jadilah yang pertama memulai diskusi!
              </p>
              <Button asChild className="mt-4 bg-ajar-teal text-white hover:bg-ajar-teal/90">
                <Link href="/community/new">Buat Diskusi Baru</Link>
              </Button>
            </div>
          ) : (
            threads.map((t) => {
              const answered = t.replies.length > 0;
              return (
                <Link key={t.id} href={`/community/${t.id}`} className="block">
                  <Card
                    className={cn(
                      "border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
                      answered ? "border-l-emerald-500" : "border-l-ajar-teal"
                    )}
                  >
                    <CardContent className="flex gap-3 p-4">
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                          avatarColor(t.user.name ?? t.user.email)
                        )}
                      >
                        {initials(t.user.name, t.user.email)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {t.isPinned && <Pin className="h-3.5 w-3.5 text-ajar-teal" />}
                          <h3 className="truncate font-semibold">{t.title}</h3>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                          {truncate(t.body, 100)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>{t.user.name ?? t.user.email}</span>
                          <span>{relativeTimeID(t.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {t._count.replies} balasan
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {t.views} views
                          </span>
                          {answered && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Dijawab oleh Instruktur
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildHref(page - 1)}>Sebelumnya</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Sebelumnya
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              {page < totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildHref(page + 1)}>Berikutnya</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Berikutnya
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden space-y-4 lg:block">
          {pinned.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Pin className="h-4 w-4 text-ajar-teal" /> Diskusi Unggulan
                </h2>
                <ul className="space-y-2">
                  {pinned.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/community/${p.id}`}
                        className="line-clamp-1 text-sm text-muted-foreground hover:text-ajar-indigo"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {contributors.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="h-4 w-4 text-ajar-teal" /> Top Kontributor
                </h2>
                <ul className="space-y-2.5">
                  {contributors.map((c) => (
                    <li key={c.id} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                          avatarColor(c.name ?? c.email)
                        )}
                      >
                        {initials(c.name, c.email)}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium">
                        {c.name ?? c.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.replies} balasan
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-ajar-teal" /> Tips Diskusi
              </h2>
              <ul className="space-y-2">
                {TIPS.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ajar-teal" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
