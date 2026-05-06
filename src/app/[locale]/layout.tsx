import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { type Locale, isLocale } from "@/shared/i18n/config";
import { getMessages } from "@/shared/i18n/get-messages";

import "@/shared/styles/globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return { title: "MoveQuest" };
  const tBrand = await getTranslations({ locale: raw, namespace: "common.brand" });
  const tHero = await getTranslations({ locale: raw, namespace: "landing.hero" });
  return {
    title: tBrand("name"),
    description: tHero("subtitle"),
    robots: { index: true, follow: true },
    referrer: "no-referrer",
  };
}

// Force per-request rendering so the CSP nonce issued in src/middleware.ts
// can be applied to Next's inline RSC scripts (constraint #29 — strict CSP
// with no `unsafe-inline`). Static prerender is incompatible with per-request
// nonces; the privacy/security posture wins over CDN cacheability for an MVP.
export const dynamic = "force-dynamic";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }
  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
