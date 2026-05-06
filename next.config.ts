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
  // Force runtime deps that Next loads via the dynamic `require.resolve`
  // inside next/dist/server/require-hook.js into the standalone tree.
  // Next's file tracer doesn't always follow that hook, so on pnpm's
  // symlinked layout the standalone bundle ships without these and
  // server.js dies at startup with errors like:
  //   `Error: Cannot find module 'styled-jsx/package.json'`
  //   `Error: Cannot find module '@swc/helpers/_/_interop_require_default'`
  // The matching `public-hoist-pattern` entries in .npmrc make the
  // ./node_modules/<pkg> symlinks exist so these globs have targets.
  outputFileTracingIncludes: {
    "*": [
      "./node_modules/styled-jsx/**",
      "./node_modules/@swc/helpers/**",
    ],
  },
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
