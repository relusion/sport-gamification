"use client";

import * as RadixProgress from "@radix-ui/react-progress";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

import { cn } from "@/shared/lib/cn";

type ProgressRootProps = ComponentPropsWithoutRef<typeof RadixProgress.Root>;

export interface ProgressBarProps extends ProgressRootProps {
  /** Current progress value, or `null` for an indeterminate bar. */
  value: number | null;
  max?: number;
  "aria-label": string;
}

/**
 * Determinate (or indeterminate) progress bar built on Radix Progress.
 * Preserves ARIA semantics (constraint #15). The fill animates via a CSS
 * transition; the global stylesheet kills transitions when
 * `prefers-reduced-motion: reduce` is set, satisfying constraint #11/#15.
 */
export const ProgressBar = forwardRef<ElementRef<typeof RadixProgress.Root>, ProgressBarProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const clamped = value === null ? null : Math.max(0, Math.min(value, max));
    const percent = clamped === null ? 0 : (clamped / max) * 100;

    return (
      <RadixProgress.Root
        ref={ref}
        value={clamped}
        max={max}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-(--radius-pill) bg-(--color-surface-muted)",
          className,
        )}
        {...props}
      >
        {clamped === null ? (
          // Indeterminate: a 33%-wide stripe slides across so users see motion,
          // not an empty bar (constraint #13: meaningful state must not rely on
          // color/value alone). Global prefers-reduced-motion rule still applies.
          <RadixProgress.Indicator
            data-slot="indicator"
            data-state="indeterminate"
            className={cn(
              "block h-full w-1/3 bg-(--color-brand)",
              "animate-[mq-indeterminate_1.2s_linear_infinite]",
            )}
          />
        ) : (
          <RadixProgress.Indicator
            data-slot="indicator"
            className={cn(
              "block h-full w-full bg-(--color-brand)",
              "transition-transform duration-(--duration-normal) ease-(--ease-standard)",
            )}
            style={{ transform: `translateX(-${100 - percent}%)` }}
          />
        )}
      </RadixProgress.Root>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
