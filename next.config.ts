import path from "node:path";
import { fileURLToPath } from "node:url";

import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Pin the workspace root so `output: "standalone"` emits to
// `.next/standalone/server.js` instead of nesting under the inferred
// monorepo root when an outer lockfile (e.g. ~/package-lock.json) is
// present on the build machine. The Azure App Service deploy workflow
// zips `.next/standalone` and runs `node server.js`, so the layout must
// match exactly.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * CSP & security headers — constraint #29.
 *
 * The header below is the static fallback applied to every response
 * (including assets not matched by middleware). The per-request CSP with a
 * nonce for inline scripts (Next's nonce mechanism) is issued by
 * `src/middleware.ts` and overrides this header for app routes.
 */
const STATIC_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: STATIC_CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
];

// Exported for unit tests; the App Service deploy path requires
// `output: "standalone"` so build emits .next/standalone/server.js.
export const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
