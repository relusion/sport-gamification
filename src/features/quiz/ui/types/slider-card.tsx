"use client";

import { useId } from "react";

import { Slider } from "@/shared/ui/slider";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

import type { TypeCardProps } from "./types";

/**
 * Slider card. Each authored answer encodes a stop position; the answer.id is
 * what gets committed when the user releases the thumb. The Radix Slider
 * (#32) carries `aria-label` on the Thumb so RTL's `getByRole("slider")` finds
 * an accessible name.
 */
export function SliderCard({
  questionId,
  prompt,
  subtitle,
  answers,
  value,
  onChange,
  ariaLabel,
}: TypeCardProps) {
  const headingId = useId();
  const stops = answers; // Already an ordered list per authoring.
  const currentIndex = (() => {
    const idx = stops.findIndex((s) => s.id === value[0]);
    return idx === -1 ? Math.floor(stops.length / 2) : idx;
  })();

  const commitIndex = (i: number) => {
    const stop = stops[i];
    if (!stop) return;
    onChange([stop.id]);
  };

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId}>{prompt}</CardHeader>
      {subtitle ? (
        <p className="px-(--space-4) text-sm text-(--color-ink-muted)">{subtitle}</p>
      ) : null}
      <CardBody>
        <div data-question-id={questionId} className="flex flex-col gap-(--space-4)">
          <Slider
            aria-label={ariaLabel ?? prompt}
            min={0}
            max={stops.length - 1}
            step={1}
            value={[currentIndex]}
            onValueChange={(v) => {
              const next = v[0];
              if (typeof next === "number") commitIndex(next);
            }}
          />
          <div
            aria-hidden
            className="flex justify-between text-sm break-words text-(--color-ink-muted)"
          >
            {stops.map((stop, i) => (
              <span
                key={stop.id}
                className={i === currentIndex ? "font-medium text-(--color-ink)" : undefined}
              >
                {stop.label}
              </span>
            ))}
          </div>
          {/* Live region announces the committed stop label for screen readers. */}
          <p className="sr-only" aria-live="polite">
            {stops[currentIndex]?.label ?? ""}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
