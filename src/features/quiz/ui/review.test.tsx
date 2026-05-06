import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { QuizQuestion } from "@/entities/question";

import enQuiz from "../../../../messages/en/quiz.json";

import { Review } from "./review";

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q-social",
    type: "single",
    area: "social",
    promptKey: "k.q.social.prompt",
    answers: [
      { id: "alone", labelKey: "k.alone", tagWeights: { calm: 1 } },
      { id: "duo", labelKey: "k.duo", tagWeights: { social: 1 } },
    ],
  },
  {
    id: "q-energy",
    type: "multi",
    area: "energy",
    promptKey: "k.q.energy.prompt",
    answers: [
      { id: "calm", labelKey: "k.calm", tagWeights: { calm: 1 } },
      { id: "burst", labelKey: "k.burst", tagWeights: { burst: 1 } },
    ],
  },
];

const TRANSLATIONS: Record<string, string> = {
  "k.q.social.prompt": "Where do you feel best?",
  "k.q.energy.prompt": "What's your energy?",
  "k.alone": "On my own",
  "k.duo": "With one friend",
  "k.calm": "Calm",
  "k.burst": "Burst",
};

const translate = (key: string) => TRANSLATIONS[key] ?? key;

function renderReview(answers: Record<string, string[]>) {
  const onEdit = vi.fn();
  const onSeeResults = vi.fn();
  render(
    <NextIntlClientProvider locale="en" messages={{ quiz: enQuiz }}>
      <Review
        questions={QUESTIONS}
        answers={answers}
        translate={translate}
        onEdit={onEdit}
        onSeeResults={onSeeResults}
      />
    </NextIntlClientProvider>,
  );
  return { onEdit, onSeeResults };
}

describe("Review", () => {
  it("lists each question with its translated prompt and answer labels", () => {
    renderReview({ "q-social": ["alone"], "q-energy": ["calm", "burst"] });
    expect(screen.getByText("Where do you feel best?")).toBeInTheDocument();
    expect(screen.getByText("On my own")).toBeInTheDocument();
    expect(screen.getByText(/calm, burst/i)).toBeInTheDocument();
  });

  it("Edit button on a row dispatches with the question index", async () => {
    const { onEdit } = renderReview({ "q-social": ["alone"], "q-energy": ["calm"] });
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await userEvent.click(editButtons[1]!);
    expect(onEdit).toHaveBeenCalledWith(1);
  });

  it("See results CTA is enabled when every step has an answer", () => {
    renderReview({ "q-social": ["alone"], "q-energy": ["burst"] });
    expect(screen.getByRole("button", { name: /see results/i })).not.toBeDisabled();
  });

  it("See results CTA is disabled (defensively) if a question is missing an answer", () => {
    renderReview({ "q-social": ["alone"] });
    const cta = screen.getByRole("button", { name: /see results/i });
    expect(cta).toBeDisabled();
    expect(cta).toHaveAttribute("aria-disabled", "true");
  });

  it("emits onSeeResults on click when enabled", async () => {
    const { onSeeResults } = renderReview({ "q-social": ["alone"], "q-energy": ["calm"] });
    await userEvent.click(screen.getByRole("button", { name: /see results/i }));
    expect(onSeeResults).toHaveBeenCalledOnce();
  });
});
