"use client";

import { useId } from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

import type { TypeCardProps } from "./types";

/**
 * Would-you-rather card. Exactly two large tappable options laid out
 * side-by-side on wide viewports, stacked on narrow ones. Selection is
 * single-choice and toggles to whichever option is clicked.
 *
 * The entity refinement (#38) guarantees `answers.length === 2` upstream;
 * this component nonetheless renders defensively.
 */
export function WouldYouRatherCard({
  questionId,
  prompt,
  subtitle,
  answers,
  value,
  onChange,
  ariaLabel,
}: TypeCardProps) {
  const headingId = useId();
  const select = (id: string) => onChange([id]);

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId}>{prompt}</CardHeader>
      {subtitle ? (
        <p className="px-(--space-4) text-sm text-(--color-ink-muted)">{subtitle}</p>
      ) : null}
      <CardBody>
        <div
          role="radiogroup"
          aria-label={ariaLabel ?? prompt}
          aria-describedby={headingId}
          data-question-id={questionId}
          className="grid grid-cols-1 gap-(--space-3) sm:grid-cols-2"
        >
          {answers.map((answer) => {
            const selected = value[0] === answer.id;
            return (
              <button
                key={answer.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => select(answer.id)}
                className={cn(
                  // 48×48 hit target on the primary "decisive" choice (#10).
                  "min-h-(--hit-primary) rounded-(--radius-lg) border px-(--space-4) py-(--space-4)",
                  "text-center text-base font-medium break-words",
                  "transition-colors duration-(--duration-fast) ease-(--ease-standard)",
                  "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
                  "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
                  selected
                    ? "border-(--color-brand) bg-(--color-brand-soft) text-(--color-brand-strong)"
                    : "border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-surface-muted)",
                )}
              >
                {answer.label}
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
