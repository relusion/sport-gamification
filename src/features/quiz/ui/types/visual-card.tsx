"use client";

import { useId } from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

import { iconForAnswer } from "./icons/icon-set";
import type { TypeCardProps } from "./types";

interface VisualCardProps extends TypeCardProps {
  /**
   * When true, behaves as multi-select. The current entity schema
   * (`QuizQuestion`) does not carry this flag, so MVP authoring renders
   * single-select. The prop stays so a future entity extension can opt in
   * without breaking the dispatcher contract.
   */
  multi?: boolean;
}

/**
 * Visual question type. Icon + label tiles in a responsive grid. Selection is
 * either single or multi; both modes pair the lit state with a check glyph
 * (constraint #11). Icons are local SVGs only (constraint #3, #48).
 */
export function VisualCard({
  questionId,
  prompt,
  subtitle,
  answers,
  value,
  onChange,
  ariaLabel,
  multi = false,
}: VisualCardProps) {
  const headingId = useId();
  const selectedSet = new Set(value);

  const toggle = (id: string) => {
    if (multi) {
      if (selectedSet.has(id)) onChange(value.filter((v) => v !== id));
      else onChange([...value, id]);
    } else {
      onChange([id]);
    }
  };

  const role = multi ? "group" : "radiogroup";
  const itemRole = multi ? "checkbox" : "radio";

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId}>{prompt}</CardHeader>
      {subtitle ? (
        <p className="px-(--space-4) text-sm text-(--color-ink-muted)">{subtitle}</p>
      ) : null}
      <CardBody>
        <div
          role={role}
          aria-label={ariaLabel ?? prompt}
          aria-describedby={headingId}
          data-question-id={questionId}
          className="grid grid-cols-2 gap-(--space-3) sm:grid-cols-3"
        >
          {answers.map((answer) => {
            const selected = selectedSet.has(answer.id);
            const Icon = iconForAnswer(answer.id);
            return (
              <button
                key={answer.id}
                type="button"
                role={itemRole}
                aria-checked={selected}
                onClick={() => toggle(answer.id)}
                className={cn(
                  "flex flex-col items-center gap-(--space-2)",
                  "min-h-(--hit-primary) rounded-(--radius-lg) border px-(--space-3) py-(--space-4)",
                  "text-center text-sm font-medium break-words",
                  "transition-colors duration-(--duration-fast) ease-(--ease-standard)",
                  "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
                  "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
                  selected
                    ? "border-(--color-brand) bg-(--color-brand-soft) text-(--color-brand-strong)"
                    : "border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-surface-muted)",
                )}
              >
                <Icon />
                <span>{answer.label}</span>
                {selected ? (
                  <span aria-hidden className="text-xs">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
