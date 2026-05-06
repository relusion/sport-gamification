import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";

export interface WhyThisFitsProps {
  /** Resolved match.results.whyThisFitsHeading. */
  heading: string;
  /** Up to 3 resolved tag names from `deriveWhyTags` × `Tag.nameKey`. */
  tagNames: readonly string[];
  className?: string;
}

/**
 * "Why this fits" section — a heading plus up to 3 Badge bullets keyed off
 * the deriver's contribution-sorted tag list. Returns null when the
 * deriver returned an empty array (constraint #47).
 */
export function WhyThisFits({ heading, tagNames, className }: WhyThisFitsProps) {
  if (tagNames.length === 0) return null;

  return (
    <section
      aria-labelledby="results-why-heading"
      className={cn("flex flex-col gap-(--space-2)", className)}
    >
      <h2
        id="results-why-heading"
        className="text-base font-semibold tracking-tight break-words"
      >
        {heading}
      </h2>
      <ul className="flex flex-wrap gap-(--space-2)">
        {tagNames.map((name) => (
          <li key={name}>
            <Badge tone="brand">{name}</Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
