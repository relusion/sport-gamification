"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/shared/ui/card";

interface RestartConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

/**
 * Inline restart confirm using existing primitives only (constraint #39 — no
 * new modal lib). Renders as a plain Card with two action buttons; the parent
 * decides where to mount it (typically replacing the type-card slot). Focus
 * lands on Cancel by default — the destructive option must be deliberate.
 */
export function RestartConfirm({ onConfirm, onCancel, className }: RestartConfirmProps) {
  const t = useTranslations("quiz.ui");
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <Card className={cn(className)} variant="muted" aria-live="polite">
      <CardHeader>{t("restart")}</CardHeader>
      <CardBody>
        <p className="text-base text-(--color-ink) break-words">{t("confirmRestart")}</p>
      </CardBody>
      <CardFooter className="flex flex-wrap justify-end gap-(--space-3)">
        <Button ref={cancelRef} variant="ghost" size="md" onClick={onCancel}>
          {t("confirmRestartNo")}
        </Button>
        <Button variant="primary" size="md" onClick={onConfirm}>
          {t("confirmRestartYes")}
        </Button>
      </CardFooter>
    </Card>
  );
}
