import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import type { QuizQuestion } from "@/entities/question";

import enQuiz from "../../../../../messages/en/quiz.json";

import { QuestionTypeDispatcher } from "./dispatcher";
import type { AnswerOption } from "./types";

function withProvider(node: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={{ quiz: enQuiz }}>
      {node}
    </NextIntlClientProvider>
  );
}

const baseAnswers: AnswerOption[] = [
  { id: "a", label: "Option A" },
  { id: "b", label: "Option B" },
];

function makeQuestion(type: QuizQuestion["type"], extraAnswers = 0): QuizQuestion {
  const total = 2 + extraAnswers;
  const answers = Array.from({ length: total }, (_, i) => ({
    id: `a-${i + 1}`,
    labelKey: `k.a${i + 1}`,
    tagWeights: { x: 1 },
  }));
  return {
    id: `q-${type}`,
    type,
    area: "social",
    promptKey: "k.q.prompt",
    answers,
  };
}

describe("QuestionTypeDispatcher", () => {
  const cases = [
    { type: "single" as const, role: "radio" },
    { type: "multi" as const, role: "checkbox" },
    { type: "would-you-rather" as const, role: "radio" },
    { type: "visual" as const, role: "radio" },
  ];

  for (const { type, role } of cases) {
    it(`renders the ${type} card`, () => {
      render(
        withProvider(
          <QuestionTypeDispatcher
            question={makeQuestion(type)}
            prompt={`Prompt for ${type}`}
            answers={baseAnswers}
            value={[]}
            onChange={() => {}}
          />,
        ),
      );
      expect(screen.getAllByRole(role).length).toBeGreaterThan(0);
    });
  }

  it("renders the slider card with role=slider", () => {
    const stops: AnswerOption[] = [
      { id: "s0", label: "Calm" },
      { id: "s1", label: "Steady" },
      { id: "s2", label: "Energetic" },
    ];
    render(
      withProvider(
        <QuestionTypeDispatcher
          question={makeQuestion("slider", 1)}
          prompt="How energetic?"
          answers={stops}
          value={["s1"]}
          onChange={() => {}}
        />,
      ),
    );
    expect(screen.getByRole("slider", { name: /how energetic/i })).toBeInTheDocument();
  });

  it("injects the translated rankingRow + move-button aria-labels", () => {
    const items: AnswerOption[] = [
      { id: "x", label: "First" },
      { id: "y", label: "Second" },
    ];
    render(
      withProvider(
        <QuestionTypeDispatcher
          question={makeQuestion("ranking")}
          prompt="Order these"
          answers={items}
          value={[]}
          onChange={() => {}}
        />,
      ),
    );
    const firstRow = screen.getAllByRole("listitem")[0]!;
    expect(firstRow.getAttribute("aria-label")).toBe(
      "Rank 1: First. Use arrow up or arrow down to reorder.",
    );
    expect(screen.getByRole("button", { name: "Move First down" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move Second up" })).toBeInTheDocument();
  });
});
