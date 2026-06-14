import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ThreadFilter, ThreadSort } from "@/lib/community-constants";

export function buildThreadWhere(
  filter: ThreadFilter,
  sort: ThreadSort,
  tenantId: string,
  userId: string,
  q: string
): Prisma.ForumThreadWhereInput {
  const where: Prisma.ForumThreadWhereInput = { tenantId };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filter === "mine") where.userId = userId;
  if (filter === "replied") where.replies = { some: { userId } };
  if (filter === "answered")
    where.replies = { some: { isInstructorReply: true } };
  if (filter === "unanswered")
    where.replies = { none: { isInstructorReply: true } };

  if (sort === "trending_week") {
    where.updatedAt = { gte: new Date(Date.now() - 7 * 86_400_000) };
  }
  return where;
}

export function buildThreadOrderBy(
  sort: ThreadSort
): Prisma.ForumThreadOrderByWithRelationInput[] {
  switch (sort) {
    case "most_replies":
    case "trending":
    case "trending_week":
      return [{ isPinned: "desc" }, { replies: { _count: "desc" } }, { updatedAt: "desc" }];
    default:
      return [{ isPinned: "desc" }, { updatedAt: "desc" }];
  }
}

/** Top community contributors by reply count. */
export async function getTopContributors(tenantId: string, take = 5) {
  const grouped = await prisma.forumReply.groupBy({
    by: ["userId"],
    where: { thread: { tenantId } },
    _count: { userId: true },
    orderBy: { _count: { userId: "desc" } },
    take,
  });
  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return grouped
    .map((g) => {
      const u = userMap.get(g.userId);
      if (!u) return null;
      return { id: u.id, name: u.name, email: u.email, replies: g._count.userId };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export async function getPinnedThreads(tenantId: string, take = 5) {
  return prisma.forumThread.findMany({
    where: { tenantId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    take,
    select: { id: true, title: true },
  });
}
