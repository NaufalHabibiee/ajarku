import { headers } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Tenant } from "@prisma/client";
import { parseHost, TENANT_HOST_HEADER } from "@/lib/tenant-host";

export {
  parseHost,
  TENANT_HOST_HEADER,
  TENANT_SLUG_HEADER,
} from "@/lib/tenant-host";

/** Look up a tenant by slug or custom domain. Cached per request. */
export const resolveTenant = cache(
  async (host: string | null): Promise<Tenant | null> => {
    const { slug, isCustomDomain, host: cleanHost } = parseHost(host);

    if (slug) {
      const bySlug = await prisma.tenant.findUnique({ where: { slug } });
      if (bySlug) return bySlug;
    }
    if (isCustomDomain) {
      const byDomain = await prisma.tenant.findUnique({
        where: { customDomain: cleanHost },
      });
      if (byDomain) return byDomain;
    }
    // Single-tenant / root-domain deployments (e.g. a *.vercel.app domain with
    // no per-tenant subdomains): resolve a configured default tenant.
    const defaultSlug = process.env.DEFAULT_TENANT_SLUG;
    if (defaultSlug) {
      const byDefault = await prisma.tenant.findUnique({
        where: { slug: defaultSlug },
      });
      if (byDefault) return byDefault;
    }
    // Auto single-tenant fallback: in development always, and in production when
    // exactly one tenant exists, serve it on the root domain. Multi-tenant
    // deployments (2+ tenants, no match) fall through to the marketing page.
    const someTenants = await prisma.tenant.findMany({
      take: 2,
      orderBy: { createdAt: "asc" },
    });
    if (process.env.NODE_ENV === "development" || someTenants.length === 1) {
      return someTenants[0] ?? null;
    }
    return null;
  }
);

/**
 * Get the current tenant inside a Server Component / Route Handler.
 *
 * Middleware runs on the Edge runtime where Prisma cannot query the database,
 * so it only forwards the request host via the `x-tenant-host` header. The
 * actual DB lookup happens here, in the Node.js server runtime.
 */
export const getTenant = cache(async (): Promise<Tenant | null> => {
  const h = await headers();
  const host = h.get(TENANT_HOST_HEADER) ?? h.get("host");
  return resolveTenant(host);
});

/** Throwing variant for pages that require a tenant. */
export async function requireTenant(): Promise<Tenant> {
  const tenant = await getTenant();
  if (!tenant) {
    throw new Error("No tenant resolved for this request");
  }
  return tenant;
}
