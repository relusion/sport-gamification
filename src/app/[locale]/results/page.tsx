import path from "node:path";
import { readFile } from "node:fs/promises";

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { z } from "zod";

import { ActivitySchema } from "@/entities/activity";
import { ArchetypeSchema } from "@/entities/archetype";
import { TagSchema } from "@/entities/tag";
import { type Locale, isLocale } from "@/shared/i18n/config";

import { ResultsClientGuard } from "./results-client-guard";
import { ResultsRouteClient } from "./results-route-client";

interface ResultsPageProps {
  params: Promise<{ locale: string }>;
}

const ActivitiesArraySchema = z.array(ActivitySchema);
const ArchetypesArraySchema = z.array(ArchetypeSchema);
const TagsArraySchema = z.array(TagSchema);

export async function generateMetadata({ params }: ResultsPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return { title: "MoveQuest" };
  const tBrand = await getTranslations({ locale: raw, namespace: "common.brand" });
  const tResults = await getTranslations({ locale: raw, namespace: "match.results" });
  return {
    title: `${tResults("heroHeadline")} — ${tBrand("name")}`,
    description: tResults("exploratoryDisclaimer"),
    robots: { index: true, follow: true },
    referrer: "no-referrer",
  };
}

/**
 * Server-component shell. Mirrors `/quiz/page.tsx`: reads + Zod-parses the
 * three catalogues at render time so `pnpm validate:content` can fail loudly
 * at build (constraint #19, #51). Inherits `force-dynamic` from the locale
 * layout — must NOT opt out (constraint #26).
 *
 * The page mounts <ResultsClientGuard> (verbatim) and the route-level client
 * wrapper that binds the `onRestart` action from `clearAll` + `router.push`
 * before handing control off to `<ResultsRevealApp>`.
 */
export default async function ResultsPage({ params }: ResultsPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  setRequestLocale(locale);

  const contentDir = path.join(process.cwd(), "content");
  const [archetypesText, activitiesText, tagsText] = await Promise.all([
    readFile(path.join(contentDir, "archetypes.json"), "utf8"),
    readFile(path.join(contentDir, "activities.json"), "utf8"),
    readFile(path.join(contentDir, "tags.json"), "utf8"),
  ]);

  const archetypes = ArchetypesArraySchema.parse(JSON.parse(archetypesText));
  const activities = ActivitiesArraySchema.parse(JSON.parse(activitiesText));
  const tags = TagsArraySchema.parse(JSON.parse(tagsText));

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen w-full max-w-4xl flex-col p-(--space-4)"
    >
      <ResultsClientGuard locale={locale} />
      <ResultsRouteClient
        activities={activities}
        archetypes={archetypes}
        tags={tags}
        locale={locale}
      />
    </main>
  );
}
