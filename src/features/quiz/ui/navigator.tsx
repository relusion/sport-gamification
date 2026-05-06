"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { ProgressBar } from "@/shared/ui/progress-bar";

interface NavigatorProps {
  /** 1-based step number; 0 hides the step label (intro/review). */
  stepNumber: number;
  total: number;
  canGoBack: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onNext: () => void;
  onRestart: () => void;
  /** Override the Next button label (e.g. "See results" on review). */
  nextLabel?: string;
  className?: string;
}

/**
 * Quiz navigator. Renders the global ProgressBar and the Next/Back/Restart
 * triggers. Restart triggers a Provider-side confirm screen — this component
 * stays presentational and only emits the intent.
 *
 * Constraint #10: Next button uses the lg variant (48×48 hit target).
 * Constraint #11: disabled state pairs aria-disabled + visible label change,
 * so screen readers and sighted users get the same signal.
 */
export function Navigator({
  stepNumber,
  total,
  canGoBack,
  canGoNext,
  onBack,
  onNext,
  onRestart,
  nextLabel,
  className,
}: NavigatorProps) {
  const t = useTranslations("quiz.ui");
  const tProgress = useTranslations("quiz.progress");

  const value = stepNumber > 0 ? stepNumber : 0;
  const progressLabel = tProgress("label", { done: value, total });

  return (
    <div className={cn("flex flex-col gap-(--space-3)", className)}>
      <ProgressBar value={value} max={total} aria-label={progressLabel} />
      <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
        <Button
          variant="ghost"
          size="md"
          onClick={onBack}
          disabled={!canGoBack}
          aria-disabled={!canGoBack}
        >
          {t("back")}
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={onRestart}
          aria-label={t("restart")}
        >
          {t("restart")}
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={!canGoNext}
          aria-disabled={!canGoNext}
        >
          {nextLabel ?? t("next")}
        </Button>
      </div>
    </div>
  );
}
