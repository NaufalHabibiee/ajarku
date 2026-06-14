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
      return prisma.tenant.findUnique({ where: { slug } });
    }
    if (isCustomDomain) {
      return prisma.tenant.findUnique({ where: { customDomain: cleanHost } });
    }
    // Root domain (no subdomain). In development, fall back to the first tenant
    // so plain `localhost:3000` works without needing a subdomain. In
    // production this returns null and the marketing/landing shell is shown.
    if (process.env.NODE_ENV === "development") {
      return prisma.tenant.findFirst({ orderBy: { createdAt: "asc" } });
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
