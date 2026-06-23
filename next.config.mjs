/** @type {import('next').NextConfig} */

// Content Security Policy. Permissive on inline scripts/styles (Next.js +
// Midtrans Snap need them) but locks down framing and restricts connect/frame
// targets to the services the app actually uses (Supabase, Bunny, Midtrans).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://video.bunnycdn.com https://api.sandbox.midtrans.com https://api.midtrans.com https://app.sandbox.midtrans.com https://app.midtrans.com",
  "frame-src 'self' https://iframe.mediadelivery.net https://app.sandbox.midtrans.com https://app.midtrans.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  // Tenant logos / course thumbnails can be hosted anywhere.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
