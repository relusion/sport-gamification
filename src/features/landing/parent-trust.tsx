import { getTranslations } from "next-intl/server";

import { Badge } from "@/shared/ui/badge";
import { Card, CardBody } from "@/shared/ui/card";

export async function LandingParentTrust() {
  const t = await getTranslations("landing.trust");

  return (
    <Card variant="muted" className="mx-auto max-w-3xl">
      <CardBody>
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-(--space-3) text-(--color-ink-muted)">{t("body")}</p>
        <ul aria-label={t("title")} className="mt-(--space-4) flex flex-wrap gap-2">
          <li>
            <Badge tone="success">{t("items.noAds")}</Badge>
          </li>
          <li>
            <Badge tone="success">{t("items.noPii")}</Badge>
          </li>
          <li>
            <Badge tone="success">{t("items.noTracking")}</Badge>
          </li>
        </ul>
      </CardBody>
    </Card>
  );
}
