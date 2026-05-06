"use client";

import { useId, useRef, type KeyboardEvent } from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

import type { TypeCardProps } from "./types";

/**
 * Single-choice card. One selectable button per answer; arrow keys cycle,
 * Enter / Space selects (native button semantics). Selection toggles to a
 * single id; clicking the same option re-emits the same selection (idempotent).
 */
export function SingleCard({
  questionId,
  prompt,
  subtitle,
  answers,
  value,
  onChange,
  ariaLabel,
}: TypeCardProps) {
  const headingId = useId();
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (id: string) => onChange([id]);

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = (index + delta + answers.length) % answers.length;
    buttonsRef.current[next]?.focus();
  };

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
          className="flex flex-col gap-(--space-2)"
        >
          {answers.map((answer, index) => {
            const selected = value[0] === answer.id;
            return (
              <button
                key={answer.id}
                ref={(el) => {
                  buttonsRef.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => select(answer.id)}
                onKeyDown={(e) => handleKey(e, index)}
                className={cn(
                  "min-h-(--hit-min) rounded-(--radius-md) border px-(--space-4) py-(--space-3)",
                  "text-left text-base break-words",
                  "transition-colors duration-(--duration-fast) ease-(--ease-standard)",
                  "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
                  "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
                  selected
                    ? "border-(--color-brand) bg-(--color-brand-soft) text-(--color-brand-strong)"
                    : "border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-surface-muted)",
                )}
              >
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
