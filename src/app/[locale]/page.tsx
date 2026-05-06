import { setRequestLocale } from "next-intl/server";

import { LandingPage } from "@/features/landing";
import { type Locale, isLocale } from "@/shared/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocaleLandingPage({ params }: PageProps) {
  const { locale: raw } = await params;
  // Layout already validates the locale; this guard keeps the type narrowing
  // honest without throwing again.
  const locale: Locale = isLocale(raw) ? raw : "en";
  setRequestLocale(locale);

  return <LandingPage locale={locale} />;
}
