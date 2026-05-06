import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { cn } from "@/shared/lib/cn";

export interface SupportingArchetype {
  id: string;
  /** Resolved name. */
  name: string;
  /** Resolved flavor sentence. */
  flavor: string;
}

export interface SupportingArchetypesProps {
  /** Section heading; only rendered when secondaries.length ≥ 1. */
  heading: string;
  secondaries: SupportingArchetype[];
  className?: string;
}

/**
 * Renders 0/1/2 supporting archetypes as a section. The 0-branch returns
 * `null` (no heading, no cards) — the parent should not render any
 * surrounding chrome conditional on count (constraint #44/#68).
 */
export function SupportingArchetypes({
  heading,
  secondaries,
  className,
}: SupportingArchetypesProps) {
  if (secondaries.length === 0) return null;

  return (
    <section
      aria-labelledby="results-supporting-heading"
      className={cn("flex flex-col gap-(--space-3)", className)}
    >
      <h2
        id="results-supporting-heading"
        className="text-lg font-semibold tracking-tight break-words"
      >
        {heading}
      </h2>
      <ul
        className={cn(
          "grid gap-(--space-3)",
          secondaries.length === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {secondaries.map((s) => (
          <li key={s.id}>
            <Card variant="muted" className="h-full">
              <CardHeader>
                <h3 className="text-base font-semibold tracking-tight break-words">{s.name}</h3>
              </CardHeader>
              <CardBody className="text-sm text-(--color-ink-muted) break-words">
                {s.flavor}
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
