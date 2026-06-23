import "./env"; // validate environment variables on server startup
import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in development to avoid
// exhausting the database connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Ensure a Supabase transaction-pooler URL runs Prisma in pgBouncer mode.
 * Without `pgbouncer=true` Prisma uses prepared statements, which collide on
 * the pooler under concurrent queries (e.g. the dashboard fires many in
 * parallel) and throw. We add it automatically so a missing query param can't
 * break production. (We intentionally do NOT cap connection_limit — the pooler
 * handles pooling, and a low limit would serialize the dashboard's parallel
 * queries and risk a function timeout.)
 */
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  const isPooler =
    url.includes("pooler.supabase.com") || /:6543(?:\/|\?|$)/.test(url);
  if (!isPooler) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has("pgbouncer")) u.searchParams.set("pgbouncer", "true");
    return u.toString();
  } catch {
    return url;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
