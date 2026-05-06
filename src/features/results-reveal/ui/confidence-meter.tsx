import type { SVGProps } from "react";

import { cn } from "@/shared/lib/cn";

export interface ConfidenceMeterProps {
  /** Localized label, already resolved by the shell (Type-cards pattern). */
  label: string;
  active: boolean;
  className?: string;
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3.5 9.5l3.5 3.5L14.5 5.5" />
    </svg>
  );
}

function DashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      <path d="M4 9h10" />
    </svg>
  );
}

/**
 * Single confidence-meter row for the activity card. Carries icon + text
 * (constraint #11/#62 — never color alone). Two states: active (check) /
 * inactive (dash). The aria-label encodes the state explicitly so screen
 * readers don't depend on glyph recognition.
 */
export function ConfidenceMeter({ label, active, className }: ConfidenceMeterProps) {
  const ariaSuffix = active ? "✓" : "—";
  return (
    <div
      role="group"
      aria-label={`${label} ${ariaSuffix}`}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "flex items-center gap-(--space-2) min-h-[var(--hit-min)] py-(--space-1)",
        active ? "text-(--color-ink)" : "text-(--color-ink-muted)",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "h-6 w-6",
          active
            ? "bg-(--color-success-soft) text-(--color-success-strong)"
            : "bg-(--color-surface-muted) text-(--color-ink-muted)",
        )}
      >
        {active ? <CheckIcon /> : <DashIcon />}
      </span>
      <span className="text-sm break-words">{label}</span>
    </div>
  );
}
