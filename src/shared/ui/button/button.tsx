import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-[var(--radius-md)] font-medium",
    "transition-colors duration-(--duration-fast) ease-(--ease-standard)",
    "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
    "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    // Constraint #8: tolerate flexible text length, no nowrap.
    "text-center break-words",
  ],
  {
    variants: {
      variant: {
        primary: "bg-(--color-brand) text-(--color-brand-ink) hover:bg-(--color-brand-strong)",
        secondary:
          "bg-(--color-surface) text-(--color-ink) border border-(--color-border) hover:bg-(--color-surface-muted)",
        ghost: "bg-transparent text-(--color-ink) hover:bg-(--color-surface-muted)",
      },
      size: {
        sm: "min-h-[var(--hit-min)] px-3 text-sm",
        md: "min-h-[var(--hit-min)] px-4 text-base",
        // lg targets primary CTA → 48px hit target (constraint #12)
        lg: "min-h-[var(--hit-primary)] px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonStyles>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonStyles({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
