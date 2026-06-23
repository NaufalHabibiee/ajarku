// Lightweight in-memory sliding-window rate limiter.
//
// NOTE: state lives in the function instance's memory, so on serverless this is
// best-effort per-instance burst protection. For strict, cross-instance limits
// swap this for @upstash/ratelimit backed by Upstash Redis.

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  // Opportunistic cleanup to bound memory.
  if (buckets.size > 5000) {
    buckets.forEach((v, k) => {
      if (v.resetAt <= now) buckets.delete(k);
    });
  }
  return {
    ok: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}
