import { getTranslations } from "next-intl/server";

import type { Locale } from "@/shared/i18n/config";
import { cn } from "@/shared/lib/cn";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";

export async function LandingHeader({ locale }: { locale: Locale }) {
  const tCommon = await getTranslations("common.brand");
  const tLanding = await getTranslations("landing.header");

  return (
    <header className={cn("flex w-full items-center justify-between p-(--space-4)")}>
      <a
        href="#main"
        className={cn(
          "absolute -top-10 left-2 rounded-(--radius-md)",
          "bg-(--color-brand) px-3 py-2 text-sm text-(--color-brand-ink)",
          "focus:top-2 focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
          "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
        )}
      >
        {tLanding("skipToContent")}
      </a>
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-2xl">
          🚀
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">
          {tCommon("name")}
        </span>
      </div>
      <LanguageSwitcher currentLocale={locale} />
    </header>
  );
}
