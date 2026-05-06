import { forwardRef, type Ref } from "react";

import { cn } from "@/shared/lib/cn";

import { ActivityCard, type ActivityCardProps } from "./activity-card";

export interface ActivityGridProps {
  /** Resolved match.results.activityGridHeading. */
  heading: string;
  /** One entry per RankedActivity; the shell maps fixture data to this shape. */
  cards: readonly ActivityCardProps[];
  /** Forwarded by the shell so it can `focus()` the heading on phase change. */
  headingRef?: Ref<HTMLHeadingElement>;
  className?: string;
}

/**
 * Activities phase grid — heading + one `ActivityCard` per ranked activity.
 * The heading carries `tabIndex={-1}` so the shell's `useEffect`-driven
 * `headingRef.current?.focus()` can land programmatically (constraint #54).
 */
export const ActivityGrid = forwardRef<HTMLDivElement, ActivityGridProps>(
  function ActivityGrid({ heading, cards, headingRef, className }, ref) {
    return (
      <section
        ref={ref}
        aria-labelledby="results-activity-grid-heading"
        className={cn("flex flex-col gap-(--space-4)", className)}
      >
        <h2
          id="results-activity-grid-heading"
          ref={headingRef}
          tabIndex={-1}
          className={cn(
            "text-2xl font-bold tracking-tight break-words",
            "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
            "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
          )}
        >
          {heading}
        </h2>
        <ul className="grid gap-(--space-3) sm:grid-cols-2">
          {cards.map((c) => (
            <li key={c.name} className="h-full">
              <ActivityCard {...c} />
            </li>
          ))}
        </ul>
      </section>
    );
  },
);
