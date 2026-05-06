import type { Locale } from "@/shared/i18n/config";

import { LandingExplainer } from "./explainer";
import { LandingHeader } from "./header";
import { LandingHero } from "./hero";
import { LandingParentTrust } from "./parent-trust";

export function LandingPage({ locale }: { locale: Locale }) {
  return (
    <div className="min-h-screen">
      <LandingHeader locale={locale} />
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-(--space-8) p-(--space-4)">
        <LandingHero locale={locale} />
        <LandingExplainer />
        <LandingParentTrust />
      </main>
    </div>
  );
}
