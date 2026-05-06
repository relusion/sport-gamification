import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";

import { ConfidenceMeter } from "./confidence-meter";

export interface TagFamily {
  /** Resolved axis label (e.g. "Where", "Who with"). */
  axisLabel: string;
  /** Resolved attribute values (e.g. ["Outdoor"], ["Solo", "Small group"]). */
  values: readonly string[];
}

export interface ConfidenceMeterRow {
  /** Resolved meter label. */
  label: string;
  active: boolean;
}

export interface ActivityCardProps {
  /** Resolved match.activities.<id>.name. */
  name: string;
  /** Resolved match.activities.<id>.fit (from MatchResult.reasonKeys.activities[<id>]). */
  fit: string;
  /** Four tag-family Badge groups (environment, socialMode, beginnerFriendliness, equipmentLevel). */
  tagFamilies: readonly TagFamily[];
  /** Four confidence-meter rows (easyToStart, needsLessons, needsEquipment, needsTeam). */
  confidence: readonly ConfidenceMeterRow[];
  className?: string;
}

/**
 * Single activity card. Renders the activity name + fit flavor + 4 tag-family
 * Badge groups + 4 confidence-meter rows (constraint #61). Resolved-string
 * props only — no `useTranslations` (constraint #39). The fallback icon
 * lives in `ArchetypeCard` only; activity cards lead with text per scope §10.
 */
export function ActivityCard({
  name,
  fit,
  tagFamilies,
  confidence,
  className,
}: ActivityCardProps) {
  return (
    <Card variant="gradient" className={cn("h-full", className)}>
      <CardHeader>
        <h3 className="text-lg font-semibold tracking-tight break-words">{name}</h3>
      </CardHeader>
      <CardBody className="flex flex-col gap-(--space-3)">
        <p className="text-sm break-words">{fit}</p>

        <dl className="flex flex-col gap-(--space-2)">
          {tagFamilies.map((family) => (
            <div key={family.axisLabel} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-(--space-2)">
              <dt className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted) break-words">
                {family.axisLabel}
              </dt>
              <dd className="flex flex-wrap gap-(--space-1)">
                {family.values.map((value) => (
                  <Badge key={value} tone="neutral">
                    {value}
                  </Badge>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="flex flex-col gap-1">
          {confidence.map((row) => (
            <li key={row.label}>
              <ConfidenceMeter label={row.label} active={row.active} />
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
