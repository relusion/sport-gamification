import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { cn } from "@/shared/lib/cn";

import { NeutralActivityIcon } from "./icons/neutral-activity";

export interface ArchetypeCardProps {
  /** Resolved match.archetypes.<id>.name (Type-cards pattern, constraint #39). */
  name: string;
  /** Resolved match.archetypes.<id>.description. */
  description: string;
  /** Resolved match.archetypes.<id>.flavor. */
  flavor: string;
  className?: string;
}

/**
 * Main archetype hero card on the archetype phase of /results. Uses the
 * `gradient` Card variant + a single neutral SVG icon — per-archetype
 * illustrations are post-MVP polish (constraint #64). Fully kid-facing
 * copy.
 */
export function ArchetypeCard({ name, description, flavor, className }: ArchetypeCardProps) {
  return (
    <Card variant="gradient" className={cn("w-full", className)}>
      <CardHeader className="flex items-center gap-(--space-3)">
        <span
          aria-hidden
          className="inline-flex h-12 w-12 items-center justify-center rounded-(--radius-md) bg-(--color-surface) text-(--color-brand-strong)"
        >
          <NeutralActivityIcon />
        </span>
        <h2 className="text-2xl font-bold tracking-tight break-words">{name}</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-(--space-3)">
        <p className="text-base break-words">{description}</p>
        <p className="text-sm italic text-(--color-ink-muted) break-words">{flavor}</p>
      </CardBody>
    </Card>
  );
}
