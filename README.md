# AjarKu — White-Label Online Course Platform

A multi-tenant SaaS where each instructor (tenant) gets their own branded course
site. Students register, subscribe monthly, and access video lessons, live
sessions, a community forum, and certificates — all scoped per tenant.

## ✨ Features

- **Multi-tenant** — each client resolved by subdomain (`acme.domain.com`) or
  custom domain; data scoped per tenant. Single-domain deploys supported via
  `DEFAULT_TENANT_SLUG`.
- **Auth** — Supabase Auth (email/password + magic link), per-tenant user
  provisioning, role-based access (student / admin / superadmin).
- **Learning** — curriculum with free/paid gating, Bunny Stream video player
  with progress tracking (resume + 90% completion), downloadable attachments.
- **Payments** — Midtrans Snap (VA / GoPay / QRIS), signature-verified webhook,
  verify-on-return, subscription activation.
- **Engagement** — learning streaks, weekly/monthly stats, achievement badges,
  in-app notifications, announcements.
- **Community** — forum with search/filter/sort, threads + replies, instructor
  badges, upvotes, view counts.
- **Live sessions**, **certificates** (PDF + public verification), **admin**
  (curriculum, lessons, FAQ, live, announcements, subscribers, branding) and
  **super-admin** (tenants, billing, analytics) panels.
- **Polish** — dark mode, responsive, collapsible teal sidebar, toasts, loading
  skeletons, error boundaries.

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (radix) |
| Database | PostgreSQL via Prisma 6 |
| Auth | Supabase Auth |
| Video | Bunny Stream |
| Payments | Midtrans |
| Email | Resend |
| Tests | Vitest + Testing Library |
| Deploy | Vercel |

## 🚀 Getting Started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env   # then fill in the values (see below)

# 3. Set up the database
npm run db:migrate     # apply migrations
npm run db:seed        # demo tenant + admin + sample course

# 4. Run
npm run dev            # http://localhost:3000
```

> In development, plain `localhost:3000` resolves to the first tenant, so no
> subdomain is needed. Demo login: `admin@demo.test` / `password123`.

### Required environment variables

See [`.env.example`](.env.example) for the full list. Minimum to run:
`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Validate them anytime with:

```bash
npm run check:env
```

## 📜 Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run test` | Run the unit test suite (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | ESLint |
| `npm run check:env` | Validate environment variables |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma helpers |

## ☁️ Deployment (Vercel)

1. Push to the `main` branch (auto-deploys).
2. Set all env vars in **Project → Settings → Environment Variables** (Production).
   - `NEXT_PUBLIC_SUPABASE_URL` must be the bare project URL (no `/rest/v1`).
   - For a single-domain deploy, set `DEFAULT_TENANT_SLUG` and
     `NEXT_PUBLIC_ROOT_DOMAIN` to your Vercel domain.
   - Use the Supabase **transaction pooler** (`:6543`) for `DATABASE_URL`; the
     app auto-appends `pgbouncer=true`.
3. Colocate the function region with your database (see `vercel.json`).

## 📚 More docs

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — multi-tenant design, data model, flows.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — dev workflow & conventions.
