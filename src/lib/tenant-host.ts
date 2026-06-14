// Pure, dependency-free tenant host helpers.
//
// This module must NOT import Prisma or any Node-only code: it is imported by
// `middleware.ts`, which runs on the Edge runtime where Prisma is unavailable.

// Header names used to pass the resolved tenant from middleware to the app.
export const TENANT_SLUG_HEADER = "x-tenant-slug";
export const TENANT_HOST_HEADER = "x-tenant-host";

/**
 * Derive a tenant slug from a request hostname.
 *
 * Rules:
 *  - `acme.yourdomain.com`      -> slug "acme"     (subdomain)
 *  - `acme.localhost:3000`      -> slug "acme"     (local subdomain)
 *  - `yourdomain.com` / `www.`  -> null            (marketing/root, no tenant)
 *  - anything else              -> custom domain (slug null, isCustomDomain)
 */
export function parseHost(host: string | null): {
  slug: string | null;
  isCustomDomain: boolean;
  host: string;
} {
  const rootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000"
  ).toLowerCase();

  const cleanHost = (host ?? "").toLowerCase().split(":")[0]; // strip port
  const rootHost = rootDomain.split(":")[0];

  if (!cleanHost) return { slug: null, isCustomDomain: false, host: cleanHost };

  // Exact root domain or www -> no tenant (marketing site).
  if (cleanHost === rootHost || cleanHost === `www.${rootHost}`) {
    return { slug: null, isCustomDomain: false, host: cleanHost };
  }

  // Subdomain of the root domain -> tenant slug.
  if (cleanHost.endsWith(`.${rootHost}`)) {
    const slug = cleanHost.slice(0, -1 * (rootHost.length + 1));
    return {
      slug: slug.split(".")[0] || null,
      isCustomDomain: false,
      host: cleanHost,
    };
  }

  // Otherwise, treat as a custom domain.
  return { slug: null, isCustomDomain: true, host: cleanHost };
}
