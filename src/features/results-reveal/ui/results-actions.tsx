import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

export interface ResultsActionsProps {
  /** Resolved match.results.restartButton. */
  restartLabel: string;
  /** Resolved match.results.reviewLink. */
  reviewLabel: string;
  /** Localized /[locale]/quiz path. */
  reviewHref: string;
  /** Restart handler — wired to clearAll + router.push at the app boundary. */
  onRestart: () => void;
  className?: string;
}

/**
 * Restart + Review-my-answers entry points (constraints #65, #66). The
 * restart handler is provided by the route shell and threads through
 * `<ResultsRevealApp>`, keeping `features/results-reveal` free of
 * sibling-feature imports (constraint #59).
 */
export function ResultsActions({
  restartLabel,
  reviewLabel,
  reviewHref,
  onRestart,
  className,
}: ResultsActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-(--space-3) sm:flex-row sm:justify-center",
        className,
      )}
    >
      <Button type="button" variant="primary" size="lg" onClick={onRestart}>
        {restartLabel}
      </Button>
      <Link
        href={reviewHref}
        className={cn(
          "inline-flex min-h-[var(--hit-min)] items-center justify-center px-(--space-3)",
          "text-(--color-brand-strong) underline underline-offset-2",
          "focus-visible:outline focus-visible:outline-(length:--focus-ring-width)",
          "focus-visible:outline-(--color-focus-ring) focus-visible:outline-offset-(--focus-ring-offset)",
        )}
      >
        {reviewLabel}
      </Link>
    </div>
  );
}
