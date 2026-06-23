# Contributing

## Setup

```bash
npm install
cp .env.example .env   # fill in values
npm run db:migrate && npm run db:seed
npm run dev
```

## Workflow

1. Branch off `main`.
2. Make your change. Keep Server Components the default; reach for Client
   Components (`"use client"`) only when you need interactivity.
3. Put data mutations in Server Actions under `src/lib/actions/` and validate
   inputs with a Zod schema from `src/lib/validations/`.
4. Run the checks below before opening a PR.

## Checks

```bash
npm run check:env      # environment variables valid
npx tsc --noEmit       # type-check
npm run lint           # ESLint
npm run test           # unit tests (Vitest)
npm run build          # production build
```

## Conventions

- **TypeScript** everywhere; avoid `any`.
- **Tailwind** for styling; use the design tokens (`bg-background`,
  `text-muted-foreground`, …) so dark mode works. AjarKu accents:
  `ajar-teal` / `ajar-indigo`.
- **Tenancy** — every DB query must filter by `tenantId`. Use the helpers in
  `src/lib/tenant.ts` / `src/lib/admin.ts`.
- **Errors** — API routes use `withApiErrorHandling` / `handleApiError`; log via
  `src/lib/logger.ts` (never `console.log` raw in committed code).
- **Tests** — colocate `*.test.ts(x)` next to the unit. Pure functions use the
  Node env; component tests add `// @vitest-environment jsdom` at the top.

## Commit messages

Imperative subject line + a short body explaining the "why". Example:

```
Add rate limiting to payment creation

Throttle Snap transaction creation per user to prevent abuse.
```
