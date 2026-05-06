import { ProgressBar } from "@/shared/ui/progress-bar";
import { cn } from "@/shared/lib/cn";

import type { TraitBar } from "../lib/derive-trait-bars";

export interface TraitBarLabelled extends TraitBar {
  /** Resolved match.components.<componentName>. */
  label: string;
}

export interface TraitBarsProps {
  /** Five bars, in fixed ComponentName order from `deriveTraitBars`. */
  bars: ReadonlyArray<TraitBarLabelled>;
  /** Section accessible name (e.g. "Your movement style"). */
  sectionLabel: string;
  className?: string;
}

/**
 * Trait visualization — five horizontal `ProgressBar` rows in fixed
 * `ComponentName` order (constraint #56). The radar chart from the mockup
 * is deferred to post-MVP polish; the source-of-truth derivation lives in
 * `deriveTraitBars`, so swapping the JSX layer later is non-breaking.
 */
export function TraitBars({ bars, sectionLabel, className }: TraitBarsProps) {
  return (
    <section
      aria-label={sectionLabel}
      className={cn("flex flex-col gap-(--space-2)", className)}
    >
      <ul className="flex flex-col gap-(--space-3)">
        {bars.map(({ component, weight, label }) => {
          const percent = Math.round(weight * 100);
          return (
            <li key={component} className="flex flex-col gap-1">
              <span className="text-sm font-medium break-words">{label}</span>
              <ProgressBar
                aria-label={label}
                value={percent}
                max={100}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
