import { prisma } from "@/lib/prisma";

/**
 * Platform's revenue share — the cut the platform keeps from each tenant's
 * subscription revenue. The remainder is paid out to the tenant (instructor).
 * Override with PLATFORM_FEE_RATE env (e.g. "0.2" for 20%).
 */
export const PLATFORM_FEE_RATE = (() => {
  const raw = parseFloat(process.env.PLATFORM_FEE_RATE ?? "");
  return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : 0.2;
})();

export function startOfMonth(d = new Date()): Date {
  const s = new Date(d);
  s.setDate(1);
  s.setHours(0, 0, 0, 0);
  return s;
}

/** Platform-wide aggregate statistics. */
export async function getPlatformStats() {
  const monthStart = startOfMonth();
  const now = new Date();

  const [
    tenants,
    activeTenants,
    users,
    students,
    activeSubscriptions,
    courses,
    publishedCourses,
    lessons,
    revenueAllTimeAgg,
    revenueThisMonthAgg,
    paidCountThisMonth,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { subscriptionStatus: "active" } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({
      where: { isSubscribed: true, subscriptionExpiry: { gt: now } },
    }),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.lesson.count(),
    prisma.subscription.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    }),
    prisma.subscription.aggregate({
      where: { status: "paid", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.subscription.count({
      where: { status: "paid", paidAt: { gte: monthStart } },
    }),
  ]);

  const revenueAllTime = revenueAllTimeAgg._sum.amount ?? 0;
  const revenueThisMonth = revenueThisMonthAgg._sum.amount ?? 0;

  return {
    tenants,
    activeTenants,
    users,
    students,
    activeSubscriptions,
    courses,
    publishedCourses,
    lessons,
    revenueAllTime,
    revenueThisMonth,
    paidCountThisMonth,
    platformCutThisMonth: Math.round(revenueThisMonth * PLATFORM_FEE_RATE),
    platformCutAllTime: Math.round(revenueAllTime * PLATFORM_FEE_RATE),
  };
}

export type TenantBilling = {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  revenueThisMonth: number;
  revenueAllTime: number;
  paidCount: number;
  platformCut: number;
  tenantPayout: number;
  isPaying: boolean;
};

/** Per-tenant billing breakdown with revenue-share split. */
export async function getTenantBilling(): Promise<TenantBilling[]> {
  const monthStart = startOfMonth();

  const [tenants, allTime, thisMonth] = await Promise.all([
    prisma.tenant.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.subscription.groupBy({
      by: ["tenantId"],
      where: { status: "paid" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.subscription.groupBy({
      by: ["tenantId"],
      where: { status: "paid", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ]);

  const allTimeMap = new Map(
    allTime.map((r) => [r.tenantId, { amount: r._sum.amount ?? 0, count: r._count }])
  );
  const monthMap = new Map(
    thisMonth.map((r) => [r.tenantId, r._sum.amount ?? 0])
  );

  return tenants.map((t) => {
    const allT = allTimeMap.get(t.id);
    const revenueAllTime = allT?.amount ?? 0;
    const revenueThisMonth = monthMap.get(t.id) ?? 0;
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      subscriptionStatus: t.subscriptionStatus,
      revenueThisMonth,
      revenueAllTime,
      paidCount: allT?.count ?? 0,
      platformCut: Math.round(revenueAllTime * PLATFORM_FEE_RATE),
      tenantPayout: Math.round(revenueAllTime * (1 - PLATFORM_FEE_RATE)),
      isPaying: revenueAllTime > 0,
    };
  });
}
