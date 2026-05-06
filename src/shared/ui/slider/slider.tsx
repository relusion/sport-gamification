"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

import { cn } from "@/shared/lib/cn";

type SliderRootProps = ComponentPropsWithoutRef<typeof RadixSlider.Root>;

export interface SliderProps extends SliderRootProps {
  /** ARIA label for screen readers; required when no visible label is paired. */
  "aria-label"?: string;
}

/**
 * Accessible slider built on Radix; preserves all aria-* (constraint #15).
 * Renders one Thumb per element of `value`/`defaultValue` so range mode works
 * with two thumbs by passing `defaultValue={[2, 8]}`.
 *
 * Hit target: thumb is sized to 44×44 CSS px (constraint #12) with a smaller
 * visual circle so the touch target exceeds the visible thumb.
 */
export const Slider = forwardRef<ElementRef<typeof RadixSlider.Root>, SliderProps>(
  ({ className, defaultValue, value, "aria-label": ariaLabel, ...props }, ref) => {
    const values = value ?? defaultValue ?? [0];
    const thumbCount = values.length;
    const thumbLabel = (index: number) =>
      thumbCount > 1 && ariaLabel ? `${ariaLabel} (${index + 1} of ${thumbCount})` : ariaLabel;
    return (
      <RadixSlider.Root
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        className={cn(
          "relative flex w-full touch-none items-center select-none",
          "h-(--hit-min) py-(--space-2)",
          className,
        )}
        {...props}
      >
        <RadixSlider.Track className="relative h-2 grow overflow-hidden rounded-(--radius-pill) bg-(--color-surface-muted)">
          <RadixSlider.Range className="absolute h-full bg-(--color-brand)" />
        </RadixSlider.Track>
        {Array.from({ length: thumbCount }).map((_, index) => (
          <RadixSlider.Thumb
            key={index}
            aria-label={thumbLabel(index)}
            // Outer 44×44 hit zone (constraint #12). Visible circle is the
            // ::after pseudo-element, centred via absolute + inset-0 + m-auto.
            // `relative` is required so the pseudo-element positions against
            // the thumb, not the Radix Track.
            className={cn(
              "relative block size-(--hit-min) rounded-full bg-transparent",
              "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
              "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
              "after:absolute after:inset-0 after:m-auto after:size-6 after:rounded-full",
              "after:bg-(--color-surface) after:shadow-[var(--shadow-soft)]",
              "after:border after:border-(--color-brand)",
            )}
          />
        ))}
      </RadixSlider.Root>
    );
  },
);
Slider.displayName = "Slider";
