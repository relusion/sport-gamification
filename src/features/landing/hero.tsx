import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/shared/i18n/config";
import { cn } from "@/shared/lib/cn";
import { Card, CardBody } from "@/shared/ui/card";

export async function LandingHero({ locale }: { locale: Locale }) {
  const t = await getTranslations("landing.hero");

  return (
    <Card variant="gradient" className="mx-auto max-w-3xl">
      <CardBody className="p-(--space-8) text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-(--color-brand-strong)">
          {t("eyebrow")}
        </p>
        <h1 className="mt-(--space-2) text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-(--space-4) text-lg text-(--color-ink-muted)">{t("subtitle")}</p>
        <div className="mt-(--space-6) flex justify-center">
          <Link
            href={`/${locale}/quiz`}
            aria-label={t("ctaAria")}
            data-testid="hero-cta"
            className={cn(
              "inline-flex min-h-(--hit-primary) items-center justify-center",
              "rounded-(--radius-md) bg-(--color-brand) px-6 text-lg font-medium text-(--color-brand-ink)",
              "transition-colors duration-(--duration-fast) ease-(--ease-standard)",
              "hover:bg-(--color-brand-strong)",
              "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
              "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
            )}
          >
            {t("cta")}
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
