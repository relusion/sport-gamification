import { getTranslations } from "next-intl/server";

import { Card, CardBody } from "@/shared/ui/card";

export async function LandingExplainer() {
  const t = await getTranslations("landing.explainer");

  return (
    <Card className="mx-auto max-w-3xl">
      <CardBody>
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-(--space-3) text-(--color-ink-muted)">{t("body")}</p>
      </CardBody>
    </Card>
  );
}
