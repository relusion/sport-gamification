"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type SVGProps,
} from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

import type { TypeCardProps } from "./types";

interface RankingCardProps extends TypeCardProps {
  /**
   * Translated row aria-label template. Receives 1-based position + label,
   * returns the screen-reader name for the row.
   */
  rowAriaLabel?: (position: number, label: string) => string;
  /** Translated aria-label for the per-row "move up" button. */
  moveUpAriaLabel?: (label: string) => string;
  /** Translated aria-label for the per-row "move down" button. */
  moveDownAriaLabel?: (label: string) => string;
}

const defaultRowAriaLabel = (position: number, label: string) =>
  `Rank ${position}: ${label}. Use arrow up or arrow down to reorder.`;
const defaultMoveUp = (label: string) => `Move ${label} up`;
const defaultMoveDown = (label: string) => `Move ${label} down`;

function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      <path d="M9 14V4" />
      <path d="M4 9l5-5 5 5" />
    </svg>
  );
}

function ArrowDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      <path d="M9 4v10" />
      <path d="M14 9l-5 5-5-5" />
    </svg>
  );
}

/**
 * Reorderable ranking list. Each row has visible Up / Down buttons (mouse,
 * touch, keyboard parity); ArrowUp / ArrowDown on a focused button also
 * moves the row, matching the original keyboard-first behaviour. Per-position
 * scoring is owned by buildProfile via the per-answer pre-authored
 * tagWeights — this card only commits the order.
 */
export function RankingCard({
  questionId,
  prompt,
  subtitle,
  answers,
  value,
  onChange,
  ariaLabel,
  rowAriaLabel = defaultRowAriaLabel,
  moveUpAriaLabel = defaultMoveUp,
  moveDownAriaLabel = defaultMoveDown,
}: RankingCardProps) {
  const headingId = useId();

  // Initial order: respect a complete prior ordering, else fall back to the
  // authored order. Avoids losing user state on re-render and avoids leaking
  // an out-of-order partial value.
  const initialOrder = (() => {
    if (value.length === answers.length) {
      const known = new Set(answers.map((a) => a.id));
      const allKnown = value.every((id) => known.has(id));
      if (allKnown && new Set(value).size === value.length) return value.slice();
    }
    return answers.map((a) => a.id);
  })();

  const [order, setOrder] = useState<string[]>(initialOrder);
  const upRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const downRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const labelById = (id: string) => answers.find((a) => a.id === id)?.label ?? id;

  const move = (id: string, delta: -1 | 1) => {
    const i = order.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= order.length) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j]!, next[i]!];
    setOrder(next);
    onChange(next);
    // Focus follows the moved item to its new position so a user can keep
    // pressing the same direction button to continue reordering.
    queueMicrotask(() => {
      const ref = delta === -1 ? upRefs.current[j] : downRefs.current[j];
      ref?.focus();
    });
  };

  // Sync upward on first mount so the parent reflects the rendered order
  // even before any user interaction (used by the "valid full ordering"
  // forward-nav guard). Empty deps + ref guard handles React 19 strict-mode
  // double-invoke correctly.
  const initialEmittedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const orderRef = useRef(order);
  orderRef.current = order;
  useEffect(() => {
    if (initialEmittedRef.current) return;
    initialEmittedRef.current = true;
    onChangeRef.current(orderRef.current);
  }, []);

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(id, -1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      move(id, 1);
    }
  };

  const moveButtonStyles = cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius-md)",
    "border border-(--color-border) bg-(--color-surface) text-(--color-ink)",
    "transition-colors duration-(--duration-fast) ease-(--ease-standard)",
    "hover:bg-(--color-surface-muted)",
    "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
    "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-(--color-surface)",
  );

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId}>{prompt}</CardHeader>
      {subtitle ? (
        <p className="px-(--space-4) text-sm text-(--color-ink-muted)">{subtitle}</p>
      ) : null}
      <CardBody>
        <ol
          aria-label={ariaLabel ?? prompt}
          aria-describedby={headingId}
          data-question-id={questionId}
          className="flex list-none flex-col gap-(--space-2)"
        >
          {order.map((id, position) => {
            const label = labelById(id);
            const atTop = position === 0;
            const atBottom = position === order.length - 1;
            return (
              <li
                key={id}
                aria-label={rowAriaLabel(position + 1, label)}
                className={cn(
                  "flex w-full items-center gap-(--space-3)",
                  "min-h-(--hit-min) rounded-(--radius-md) border px-(--space-4) py-(--space-3)",
                  "border-(--color-border) bg-(--color-surface) text-base break-words",
                )}
              >
                <span
                  aria-hidden
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-(--color-brand-soft) text-sm font-semibold text-(--color-brand-strong)"
                >
                  {position + 1}
                </span>
                <span className="flex-1 font-medium">{label}</span>
                <button
                  ref={(el) => {
                    upRefs.current[position] = el;
                  }}
                  type="button"
                  aria-label={moveUpAriaLabel(label)}
                  disabled={atTop}
                  onClick={() => move(id, -1)}
                  onKeyDown={(e) => handleKey(e, id)}
                  className={moveButtonStyles}
                >
                  <ArrowUpIcon />
                </button>
                <button
                  ref={(el) => {
                    downRefs.current[position] = el;
                  }}
                  type="button"
                  aria-label={moveDownAriaLabel(label)}
                  disabled={atBottom}
                  onClick={() => move(id, 1)}
                  onKeyDown={(e) => handleKey(e, id)}
                  className={moveButtonStyles}
                >
                  <ArrowDownIcon />
                </button>
              </li>
            );
          })}
        </ol>
      </CardBody>
    </Card>
  );
}
