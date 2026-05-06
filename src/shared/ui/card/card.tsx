import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

const cardStyles = cva(
  [
    "block rounded-(--radius-lg) border border-(--color-border)",
    "shadow-[var(--shadow-card)]",
    "overflow-hidden",
  ],
  {
    variants: {
      variant: {
        plain: "bg-(--color-surface) text-(--color-ink)",
        gradient:
          "bg-gradient-to-br from-(--color-brand-soft) to-(--color-surface) text-(--color-ink)",
        muted: "bg-(--color-surface-muted) text-(--color-ink)",
      },
    },
    defaultVariants: {
      variant: "plain",
    },
  },
);

export type CardVariants = VariantProps<typeof cardStyles>;
export interface CardProps extends HTMLAttributes<HTMLDivElement>, CardVariants {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(cardStyles({ variant }), className)} {...props}>
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

const slotBase = "break-words";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(slotBase, "p-(--space-4) pb-(--space-2) text-lg font-semibold", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(slotBase, "p-(--space-4)", className)} {...props} />
  ),
);
CardBody.displayName = "CardBody";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(slotBase, "p-(--space-4) pt-(--space-2) text-sm text-(--color-ink-muted)", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";
