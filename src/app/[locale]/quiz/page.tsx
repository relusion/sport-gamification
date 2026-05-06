import path from "node:path";
import { readFile } from "node:fs/promises";

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { z } from "zod";

import { QuizQuestionSchema } from "@/entities/question";
import { QuizApp } from "@/features/quiz";
import { type Locale, isLocale } from "@/shared/i18n/config";

interface QuizPageProps {
  params: Promise<{ locale: string }>;
}

const QuestionsArraySchema = z.array(QuizQuestionSchema);

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return { title: "MoveQuest" };
  const tBrand = await getTranslations({ locale: raw, namespace: "common.brand" });
  const tIntro = await getTranslations({ locale: raw, namespace: "quiz.ui.intro" });
  return {
    title: `${tIntro("title")} — ${tBrand("name")}`,
    description: tIntro("subtitle"),
    robots: { index: true, follow: true },
    referrer: "no-referrer",
  };
}

/**
 * Server-component shell. Loads + Zod-validates `content/questions.json` at
 * render time (constraint #19). Validation error throws and is reported by
 * `pnpm validate:content` at build time, so a malformed question never reaches
 * the browser. Inherits `force-dynamic` from the locale layout (#26).
 */
export default async function QuizPage({ params }: QuizPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  setRequestLocale(locale);

  const file = path.join(process.cwd(), "content", "questions.json");
  const raw_text = await readFile(file, "utf8");
  const questions = QuestionsArraySchema.parse(JSON.parse(raw_text));

  return <QuizApp questions={questions} locale={locale} />;
}
