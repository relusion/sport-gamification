"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import type { Activity } from "@/entities/activity";
import type { Archetype } from "@/entities/archetype";
import type { Tag } from "@/entities/tag";
import type { QuizProfile } from "@/entities/quiz-profile";
import {
  computeMatchResult,
  TOP_ACTIVITY_COUNT,
  type MatchResult,
} from "@/entities/match-result";
import { readProfile } from "@/features/quiz/model/storage";
import type { Locale } from "@/shared/i18n/config";

import { deriveTraitBars } from "../lib/derive-trait-bars";
import { deriveConfidence } from "../lib/derive-confidence";
import { deriveWhyTags } from "../lib/derive-why-tags";

import { ArchetypeCard } from "./archetype-card";
import { SupportingArchetypes } from "./supporting-archetypes";
import { TraitBars } from "./trait-bars";
import { WhyThisFits } from "./why-this-fits";
import { RevealCta } from "./reveal-cta";
import { ActivityGrid } from "./activity-grid";
import { ResultsActions } from "./results-actions";
import type { ActivityCardProps, TagFamily, ConfidenceMeterRow } from "./activity-card";

type Phase = "archetype" | "activities";

export interface ResultsRevealAppProps {
  activities: Activity[];
  archetypes: Archetype[];
  tags: Tag[];
  locale: Locale;
  /** Wired at the app boundary to clearAll() + router.push (constraint #59). */
  onRestart: () => void;
}

type TagFamilyKey = "environment" | "social" | "beginnerFriendliness" | "equipmentLevel";
type AttributeAxis = "environment" | "socialMode" | "beginnerFriendliness" | "equipmentLevel";

interface TagFamilyConfig {
  key: TagFamilyKey;
  attributeAxis: AttributeAxis;
  values: (a: Activity) => readonly string[];
}

const TAG_FAMILY_CONFIG: ReadonlyArray<TagFamilyConfig> = [
  { key: "environment", attributeAxis: "environment", values: (a) => a.environment },
  { key: "social", attributeAxis: "socialMode", values: (a) => a.socialMode },
  {
    key: "beginnerFriendliness",
    attributeAxis: "beginnerFriendliness",
    values: (a) => [a.beginnerFriendliness],
  },
  {
    key: "equipmentLevel",
    attributeAxis: "equipmentLevel",
    values: (a) => [a.equipmentLevel],
  },
];

const MATCH_PREFIX = "match.";
/**
 * Strip the `match.` namespace prefix so a key like `match.tags.calm.name`
 * resolves under `useTranslations('match')`. The Tag/Activity/Archetype
 * `nameKey` contract is "starts with `match.`" — `validate-content` enforces
 * the catalogue shapes; we throw in dev if a future authoring drift slips
 * through, rather than silently returning an unresolvable raw key.
 */
function relMatch(fullKey: string): string {
  if (!fullKey.startsWith(MATCH_PREFIX)) {
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
      throw new Error(`results-reveal: nameKey '${fullKey}' must start with 'match.'`);
    }
    return fullKey;
  }
  return fullKey.slice(MATCH_PREFIX.length);
}

/**
 * Single Client Component boundary for /results (constraint #50). Reads the
 * QuizProfile via the storage adapter post-mount, computes the MatchResult
 * once via useMemo (constraint #52, no persistence — #41), holds the reveal
 * phase as a 2-state union (constraint #53), and shifts focus to the
 * activity-grid heading on phase transition (constraint #54). Resolved
 * translations are bound here once and threaded as props to leaves
 * (Type-cards pattern, constraint #39).
 */
export function ResultsRevealApp({
  activities,
  archetypes,
  tags,
  locale,
  onRestart,
}: ResultsRevealAppProps) {
  const t = useTranslations("match");

  // Profile is browser-only (sessionStorage); initialise post-mount so the
  // server render and first hydration match (no profile available SSR-side).
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  useEffect(() => {
    setProfile(readProfile());
  }, []);

  const matchResult = useMemo<MatchResult | null>(() => {
    if (!profile) return null;
    return computeMatchResult(profile, activities, archetypes, tags);
  }, [profile, activities, archetypes, tags]);

  const [phase, setPhase] = useState<Phase>("archetype");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === "activities") {
      headingRef.current?.focus();
    }
  }, [phase]);

  const archetypeById = useMemo(
    () => new Map(archetypes.map((a) => [a.id, a])),
    [archetypes],
  );
  const activityById = useMemo(
    () => new Map(activities.map((a) => [a.id, a])),
    [activities],
  );
  const tagById = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);

  const mainArchetype = matchResult ? archetypeById.get(matchResult.mainArchetypeId) : undefined;

  const traitBars = useMemo(() => {
    if (!mainArchetype) return [];
    return deriveTraitBars(mainArchetype, tags).map((bar) => ({
      ...bar,
      label: t(`components.${bar.component}`),
    }));
  }, [mainArchetype, tags, t]);

  const whyTagNames = useMemo(() => {
    if (!profile || !mainArchetype) return [];
    const ids = deriveWhyTags(profile, mainArchetype, tags);
    return ids.map((id) => {
      const tag = tagById.get(id);
      return tag ? t(relMatch(tag.nameKey)) : id;
    });
  }, [profile, mainArchetype, tags, tagById, t]);

  const supportingArchetypes = useMemo(() => {
    if (!matchResult) return [];
    return matchResult.secondaryArchetypeIds
      .map((id) => {
        const a = archetypeById.get(id);
        if (!a) return null;
        return {
          id: a.id,
          name: t(`archetypes.${a.id}.name`),
          flavor: t(`archetypes.${a.id}.flavor`),
        };
      })
      .filter((s): s is { id: string; name: string; flavor: string } => s !== null);
  }, [matchResult, archetypeById, t]);

  const activityCards = useMemo<ActivityCardProps[]>(() => {
    if (!matchResult) return [];
    const cards: ActivityCardProps[] = [];
    for (const ranked of matchResult.rankedActivities.slice(0, TOP_ACTIVITY_COUNT)) {
      const activity = activityById.get(ranked.id);
      if (!activity) continue;
      const conf = deriveConfidence(activity);
      const tagFamilies: TagFamily[] = TAG_FAMILY_CONFIG.map((family) => ({
        axisLabel: t(`results.tagFamilies.${family.key}`),
        values: family.values(activity).map((v) =>
          t(`results.attributeValues.${family.attributeAxis}.${v}`),
        ),
      }));
      const confidence: ConfidenceMeterRow[] = [
        { label: t("results.confidenceMeters.easyToStart"), active: conf.easyToStart },
        { label: t("results.confidenceMeters.needsLessons"), active: conf.needsLessons },
        { label: t("results.confidenceMeters.needsEquipment"), active: conf.needsEquipment },
        { label: t("results.confidenceMeters.needsTeam"), active: conf.needsTeam },
      ];
      cards.push({
        name: t(`activities.${ranked.id}.name`),
        fit: t(`activities.${ranked.id}.fit`),
        tagFamilies,
        confidence,
      });
    }
    return cards;
  }, [matchResult, activityById, t]);

  if (!profile || !matchResult || !mainArchetype) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-(--space-6) p-(--space-4)">
      <h1 className="text-3xl font-bold tracking-tight break-words">
        {t("results.heroHeadline")}
      </h1>

      {phase === "archetype" ? (
        <>
          <ArchetypeCard
            name={t(`archetypes.${mainArchetype.id}.name`)}
            description={t(`archetypes.${mainArchetype.id}.description`)}
            flavor={t(`archetypes.${mainArchetype.id}.flavor`)}
          />

          <TraitBars bars={traitBars} sectionLabel={t("results.heroHeadline")} />

          <WhyThisFits
            heading={t("results.whyThisFitsHeading")}
            tagNames={whyTagNames}
          />

          <SupportingArchetypes
            heading={t("results.supportingArchetypesHeading")}
            secondaries={supportingArchetypes}
          />

          <p className="text-sm text-(--color-ink-muted) break-words">
            {t("results.exploratoryDisclaimer")}
          </p>

          <RevealCta
            label={t("results.revealCta")}
            subtitle={t("results.revealCtaSubtitle")}
            onReveal={() => setPhase("activities")}
          />
        </>
      ) : (
        <ActivityGrid
          heading={t("results.activityGridHeading")}
          cards={activityCards}
          headingRef={headingRef}
        />
      )}

      <ResultsActions
        restartLabel={t("results.restartButton")}
        reviewLabel={t("results.reviewLink")}
        reviewHref={`/${locale}/quiz`}
        onRestart={onRestart}
      />
    </div>
  );
}
