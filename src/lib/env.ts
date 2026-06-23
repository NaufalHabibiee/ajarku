import { z } from "zod";

/**
 * Validates the server environment variables. Required vars (DB + Supabase)
 * must be present; integration keys are optional.
 *
 * On import it validates lazily: in development a missing/invalid var throws
 * (fail fast), in production it only logs (never crashes a running deploy).
 * Use `assertEnv()` (e.g. in CI / `npm run check:env`) for a hard check.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL (no /rest/v1 path)"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().optional(),
  DEFAULT_TENANT_SLUG: z.string().optional(),
  MIDTRANS_SERVER_KEY: z.string().optional(),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"]).optional(),
  BUNNY_API_KEY: z.string().optional(),
  BUNNY_STREAM_LIBRARY_ID: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parse() {
  return envSchema.safeParse(process.env);
}

/** Hard assertion — throws with a readable message if env is invalid. */
export function assertEnv(): Env {
  const result = parse();
  if (!result.success) {
    const issues = JSON.stringify(result.error.flatten().fieldErrors, null, 2);
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return result.data;
}

// Lazy validation on first server import.
const result = parse();
if (!result.success && process.env.SKIP_ENV_VALIDATION !== "1") {
  const message =
    "Invalid/missing environment variables: " +
    JSON.stringify(result.error.flatten().fieldErrors);
  if (process.env.NODE_ENV === "production") {
    console.error("⚠️ " + message);
  } else {
    throw new Error(message);
  }
}

export const env: Env = (result.success ? result.data : process.env) as Env;
