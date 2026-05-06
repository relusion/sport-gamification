import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes, type SVGProps } from "react";

import { cn } from "@/shared/lib/cn";

const badgeStyles = cva(
  [
    "inline-flex items-center gap-1.5 rounded-(--radius-pill)",
    "px-(--space-3) py-(--space-1) text-xs font-medium",
    "border break-words",
  ],
  {
    variants: {
      tone: {
        neutral: "bg-(--color-surface-muted) text-(--color-ink) border-(--color-border)",
        brand: "bg-(--color-brand-soft) text-(--color-brand-strong) border-(--color-brand-soft)",
        success:
          "bg-(--color-success-soft) text-(--color-success-strong) border-(--color-success-strong)",
        warning:
          "bg-(--color-warning-soft) text-(--color-warning-strong) border-(--color-warning-strong)",
        danger:
          "bg-(--color-danger-soft) text-(--color-danger-strong) border-(--color-danger-strong)",
        info: "bg-(--color-info-soft) text-(--color-info-strong) border-(--color-info-strong)",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeVariants = VariantProps<typeof badgeStyles>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, BadgeVariants {}

// Constraint #13: every status signal must have a non-color companion.
// Each tone returns its own glyph; tones without a status meaning return null.
function ToneIcon({ tone }: { tone: BadgeProps["tone"] }) {
  const props: SVGProps<SVGSVGElement> = {
    width: 14,
    height: 14,
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": true,
    focusable: false,
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (tone) {
    case "success":
      return (
        <svg {...props}>
          <path d="M3 8.5l3 3 7-7" />
        </svg>
      );
    case "warning":
      return (
        <svg {...props}>
          <path d="M8 2l6.5 11h-13L8 2z" />
          <path d="M8 7v3" />
          <path d="M8 12.5v.5" />
        </svg>
      );
    case "danger":
      return (
        <svg {...props}>
          <circle cx={8} cy={8} r={6} />
          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" />
        </svg>
      );
    case "info":
      return (
        <svg {...props}>
          <circle cx={8} cy={8} r={6} />
          <path d="M8 7v4" />
          <path d="M8 5v.5" />
        </svg>
      );
    default:
      return null;
  }
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = "neutral", children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeStyles({ tone }), className)} {...props}>
        <ToneIcon tone={tone} />
        <span>{children}</span>
      </span>
    );
  },
);
Badge.displayName = "Badge";
