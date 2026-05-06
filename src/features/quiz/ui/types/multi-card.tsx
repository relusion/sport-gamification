"use client";

import { useId } from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

import type { TypeCardProps } from "./types";

/**
 * Multi-select card. Each answer is a checkbox; selection toggles per item.
 * Selection order is preserved (used by buildProfile only as a unique-set, but
 * preserving order keeps the review screen stable).
 */
export function MultiCard({
  questionId,
  prompt,
  subtitle,
  answers,
  value,
  onChange,
  ariaLabel,
}: TypeCardProps) {
  const headingId = useId();
  const selectedSet = new Set(value);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId}>{prompt}</CardHeader>
      {subtitle ? (
        <p className="px-(--space-4) text-sm text-(--color-ink-muted)">{subtitle}</p>
      ) : null}
      <CardBody>
        <div
          role="group"
          aria-label={ariaLabel ?? prompt}
          aria-describedby={headingId}
          data-question-id={questionId}
          className="flex flex-col gap-(--space-2)"
        >
          {answers.map((answer) => {
            const checked = selectedSet.has(answer.id);
            return (
              <button
                key={answer.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(answer.id)}
                className={cn(
                  "min-h-(--hit-min) rounded-(--radius-md) border px-(--space-4) py-(--space-3)",
                  "text-left text-base break-words",
                  "transition-colors duration-(--duration-fast) ease-(--ease-standard)",
                  "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
                  "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
                  checked
                    ? "border-(--color-brand) bg-(--color-brand-soft) text-(--color-brand-strong)"
                    : "border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-surface-muted)",
                )}
              >
                {/* Constraint #11: pair color signal with a non-color glyph. */}
                <span aria-hidden className="mr-(--space-2) inline-block w-4 text-center">
                  {checked ? "✓" : "○"}
                </span>
                <span className="font-medium">{answer.label}</span>
                {answer.hint ? (
                  <span className="block text-sm text-(--color-ink-muted)">{answer.hint}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
