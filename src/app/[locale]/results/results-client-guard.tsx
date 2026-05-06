"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { readProfile } from "@/features/quiz/model/storage";
import type { Locale } from "@/shared/i18n/config";

interface ResultsClientGuardProps {
  locale: Locale;
}

/**
 * Mirrors the cross-feature contract for 04 (constraint #37): on /results,
 * read the QuizProfile via safeParse; on miss (incl. version drift) redirect
 * to /[locale]/quiz. sessionStorage is browser-only, so the guard runs
 * client-side after hydration; the placeholder card briefly shows in the
 * miss case until the redirect completes.
 */
export function ResultsClientGuard({ locale }: ResultsClientGuardProps) {
  const router = useRouter();
  useEffect(() => {
    const profile = readProfile();
    if (!profile) router.replace(`/${locale}/quiz`);
  }, [locale, router]);
  return null;
}
