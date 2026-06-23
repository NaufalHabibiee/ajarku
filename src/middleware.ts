import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  parseHost,
  TENANT_HOST_HEADER,
  TENANT_SLUG_HEADER,
} from "@/lib/tenant-host";
import { logger, errorMessage } from "@/lib/logger";

// Route prefixes that require an authenticated user.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/learn",
  "/community",
  "/live",
  "/profile",
  "/subscription",
  "/subscribe",
  "/admin",
  "/superadmin",
];

// Auth pages an already-authenticated user should be bounced away from.
const AUTH_PAGES = ["/login", "/register"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host");
  const { slug, isCustomDomain } = parseHost(host);

  // Forward the resolved host/slug to Server Components via request headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_HOST_HEADER, host ?? "");
  if (slug) requestHeaders.set(TENANT_SLUG_HEADER, slug);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  try {
    // Refresh the Supabase auth session and mirror cookies onto the response.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: { headers: requestHeaders },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Only apply auth-based redirects when we have a tenant context. On the bare
    // root domain (no subdomain / custom domain) there is no tenant, so the app
    // can't resolve a user — redirecting here would create an infinite loop
    // (/login -> /dashboard -> /login). In development we treat the root domain
    // as having context because resolveTenant() falls back to the first tenant.
    const hasTenantContext =
      Boolean(slug) ||
      isCustomDomain ||
      process.env.NODE_ENV === "development" ||
      Boolean(process.env.DEFAULT_TENANT_SLUG);

    if (hasTenantContext) {
      if (isProtected(pathname) && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }

      if (user && AUTH_PAGES.includes(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    // Never let a transient auth/network error blank the whole app — fall open
    // and let the page-level guards handle authentication.
    logger.warn("middleware session refresh failed", {
      pathname,
      error: errorMessage(error),
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
