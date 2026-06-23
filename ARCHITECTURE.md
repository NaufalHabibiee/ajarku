# Architecture

## Multi-tenancy

Every request is scoped to a **tenant**. Resolution happens in two stages
because middleware runs on the Edge runtime (no Prisma access):

1. **`src/middleware.ts`** (Edge) — parses the hostname with the Prisma-free
   `src/lib/tenant-host.ts` and forwards the host/slug to Server Components via
   the `x-tenant-host` / `x-tenant-slug` request headers. It also refreshes the
   Supabase session and does auth redirects (wrapped in try-catch, fail-open).
2. **`src/lib/tenant.ts`** (Node) — `getTenant()` reads the header and
   `resolveTenant()` looks the tenant up in the DB:
   - subdomain slug → `Tenant.slug`
   - else custom domain → `Tenant.customDomain`
   - else `DEFAULT_TENANT_SLUG`, else (single-tenant) the only tenant, else the
     marketing fallback.

All queries filter by `tenantId`. Auth bridges Supabase users to a per-tenant
`User` row (`src/lib/auth.ts`), with `authId` unique **per tenant**.

## Layers

```
src/
├─ app/
│  ├─ (public)/      landing, pricing, lesson preview  + SiteHeader/Footer
│  ├─ (auth)/        login, register, callback
│  ├─ (app)/         student area (DashboardChrome shell) — dashboard, learn,
│  │                 community, live, subscription, profile
│  ├─ (admin)/       instructor admin panel
│  ├─ (superadmin)/  platform owner console
│  ├─ api/           route handlers (progress, payment, certificate, uploads)
│  ├─ payment/       Snap result pages
│  └─ verify/[code]/ public certificate verification
├─ components/       ui (shadcn), landing, dashboard, admin, community, …
└─ lib/              prisma, auth, tenant, midtrans, bunny, badges, streak,
                     notifications, validations/, env, logger, rate-limit, …
```

## Key flows

- **Lesson access** — `canAccessLesson()` gates paid lessons behind an active
  subscription; free lessons are open.
- **Progress** — `POST /api/progress` saves watch time, marks completion at
  90%, bumps the WIB-based streak, evaluates badges, and issues a certificate
  when the course is complete.
- **Payments** — `POST /api/payment/create` (rate-limited) creates a Snap
  transaction + pending `Subscription`; the signature-verified webhook (and
  verify-on-return) activate the subscription for +30 days.
- **Notifications/badges** — generated idempotently on dashboard load
  (`syncNotifications`, `evaluateBadges`), parallelized to keep latency low.

## Data model (Prisma)

`Tenant` → `User`, `Course` → `Module` → `Lesson`, `Progress`, `Subscription`,
`LiveSession`, `ForumThread` → `ForumReply`, `Announcement`, `Certificate`,
`Notification`, `Badge`, `FAQ`. See `prisma/schema.prisma`.

## Conventions

- Server Components by default; Client Components only for interactivity.
- Mutations via Server Actions (`src/lib/actions/*`) validated with Zod
  (`src/lib/validations/*`).
- Time/day logic is computed in **WIB** (`src/lib/time.ts`).
- Brand colors are CSS variables driven by the tenant (`--brand`); AjarKu's
  fixed palette is `ajar-teal #14B8A6` / `ajar-indigo #6366F1`.
