"use client";

import { useTranslations } from "next-intl";

import { QuestionAreaSchema, type QuestionArea } from "@/entities/question";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";

const AREAS = QuestionAreaSchema.options;

interface MovementMapProps {
  /**
   * Set of areas with at least one committed answer. Lit areas show the
   * "answered" affordance (success tone + check glyph from Badge). Areas not
   * in the set render in the neutral tone.
   */
  litAreas: ReadonlySet<QuestionArea>;
  className?: string;
}

/**
 * Area-progress sidebar (constraint #49). One Badge per question area; lit
 * state pairs the success-tone color with the Badge's built-in check glyph
 * (constraint #11). All copy comes from `quiz.areas.*` — no sport names.
 */
export function MovementMap({ litAreas, className }: MovementMapProps) {
  const t = useTranslations("quiz.areas");
  const tMap = useTranslations("quiz.movementMap");

  return (
    <nav
      aria-label={tMap("title")}
      className={cn("flex flex-col gap-(--space-2)", className)}
    >
      <h2 className="text-sm font-semibold text-(--color-ink-muted) uppercase tracking-wide">
        {tMap("title")}
      </h2>
      <ul className="flex flex-col gap-(--space-1)">
        {AREAS.map((area) => {
          const lit = litAreas.has(area);
          return (
            <li key={area}>
              <Badge
                tone={lit ? "success" : "neutral"}
                aria-label={`${t(area)} — ${lit ? tMap("areaLit") : tMap("areaUnlit")}`}
                className="w-full justify-start"
              >
                {t(area)}
              </Badge>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
