import { NextResponse, type NextRequest } from "next/server";

import { LOCALES, LOCALE_COOKIE_NAME, isLocale } from "@/shared/i18n/config";
import { negotiateLocale } from "@/shared/i18n/negotiate-locale";

/**
 * CSP — constraint #29.
 *
 * - `default-src 'self'` blocks any third-party origin by default.
 * - `script-src` carries a per-request nonce; Next inline scripts (RSC payload,
 *   route data) are signed with `x-nonce` + this header. `'strict-dynamic'`
 *   lets nonced scripts load further chunks without listing each by URL.
 * - `connect-src 'self'` blocks beacons / fetch to any other origin.
 * - `img-src 'self' data:` allows inline data: URIs (icons) only.
 * - `frame-ancestors 'none'` is clickjacking defence-in-depth; `none` because
 *   we never embed in another origin.
 */
const IS_DEV = process.env.NODE_ENV !== "production";

function buildCsp(nonce: string): string {
  // React Refresh / webpack HMR uses eval() and a websocket to localhost in
  // dev only — relax script-src and connect-src in dev so the page hydrates.
  // Production keeps strict 'self' + nonce + strict-dynamic, which is what
  // the Playwright + CI gates lock in.
  const scriptSrc = IS_DEV
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const connectSrc = IS_DEV ? "connect-src 'self' ws: wss:" : "connect-src 'self'";

  const directives: string[] = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    connectSrc,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];
  return directives.join("; ");
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64");
}

function withSecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("x-nonce", nonce);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  // Forward both x-nonce and the CSP on the *request* so Next stamps its
  // inline RSC scripts with this nonce. Per Next docs, both are required.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const firstSegment = pathname.split("/")[1] ?? "";
  if (isLocale(firstSegment)) {
    return withSecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      nonce,
    );
  }

  // Locale negotiation only runs for paths that aren't already locale-prefixed.
  const acceptLanguage = request.headers.get("accept-language");
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value ?? null;
  const locale = negotiateLocale({ acceptLanguage, cookieLocale });

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });
  return withSecurityHeaders(response, nonce);
}

export const config = {
  // Match everything except Next internals, static assets, and api routes.
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};

export const SUPPORTED_LOCALES = LOCALES;
