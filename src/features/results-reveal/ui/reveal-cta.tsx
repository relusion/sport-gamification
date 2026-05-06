import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

export interface RevealCtaProps {
  /** Resolved match.results.revealCta. */
  label: string;
  /** Resolved match.results.revealCtaSubtitle (optional supporting copy). */
  subtitle?: string;
  /** Phase transition handler — bound by the shell. */
  onReveal: () => void;
  className?: string;
}

/**
 * Primary "Reveal activity ideas" CTA — gates sport names (constraint #55).
 * Kid-facing copy; ≥48×48 hit target via Button size="lg" (constraint #10);
 * visible focus ring via the Button primitive's focus styles.
 */
export function RevealCta({ label, subtitle, onReveal, className }: RevealCtaProps) {
  return (
    <div className={cn("flex flex-col items-center gap-(--space-2)", className)}>
      <Button type="button" variant="primary" size="lg" onClick={onReveal}>
        {label}
      </Button>
      {subtitle ? (
        <p className="text-sm text-(--color-ink-muted) text-center break-words">{subtitle}</p>
      ) : null}
    </div>
  );
}
