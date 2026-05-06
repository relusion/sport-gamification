"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { Activity } from "@/entities/activity";
import type { Archetype } from "@/entities/archetype";
import type { Tag } from "@/entities/tag";
import { clearAll } from "@/features/quiz";
import { ResultsRevealApp } from "@/features/results-reveal";
import type { Locale } from "@/shared/i18n/config";

interface ResultsRouteClientProps {
  activities: Activity[];
  archetypes: Archetype[];
  tags: Tag[];
  locale: Locale;
}

/**
 * Thin client wrapper at the app boundary (constraint #59). Owns the
 * `clearAll` import from `@/features/quiz` and binds the restart action
 * (clearAll → router.push) before threading it as the `onRestart` prop
 * to the feature module. Keeps `features/results-reveal/*` free of any
 * sibling-feature import.
 */
export function ResultsRouteClient({
  activities,
  archetypes,
  tags,
  locale,
}: ResultsRouteClientProps) {
  const router = useRouter();
  const onRestart = useCallback(() => {
    clearAll();
    router.push(`/${locale}/quiz`);
  }, [locale, router]);

  return (
    <ResultsRevealApp
      activities={activities}
      archetypes={archetypes}
      tags={tags}
      locale={locale}
      onRestart={onRestart}
    />
  );
}
