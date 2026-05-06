import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { QuizQuestion } from "@/entities/question";

import enQuiz from "../../../../messages/en/quiz.json";

import { QuizApp } from "./quiz-app";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn() }),
}));

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    type: "single",
    area: "social",
    promptKey: "test.q1.prompt",
    answers: [
      { id: "a", labelKey: "test.q1.a", tagWeights: { calm: 1 } },
      { id: "b", labelKey: "test.q1.b", tagWeights: { social: 1 } },
    ],
  },
  {
    id: "q2",
    type: "multi",
    area: "movement",
    promptKey: "test.q2.prompt",
    answers: [
      { id: "indoor", labelKey: "test.q2.indoor", tagWeights: { indoor: 1 } },
      { id: "outdoor", labelKey: "test.q2.outdoor", tagWeights: { outdoor: 1 } },
    ],
  },
];

const messages = {
  quiz: enQuiz,
  test: {
    q1: { prompt: "Where do you feel best?", a: "On my own", b: "With one friend" },
    q2: { prompt: "Indoor or outdoor?", indoor: "Indoor", outdoor: "Outdoor" },
  },
} as const;

function renderApp() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QuizApp questions={QUESTIONS} locale="en" />
    </NextIntlClientProvider>,
  );
}

describe("QuizApp", () => {
  beforeEach(() => {
    sessionStorage.clear();
    pushMock.mockClear();
  });
  afterEach(() => {
    sessionStorage.clear();
  });

  it("renders the intro phase on first mount", () => {
    renderApp();
    expect(screen.getByRole("button", { name: /^start$/i })).toBeInTheDocument();
  });

  it("walks intro → step → review → seeResults → router.push to /[locale]/results", async () => {
    renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^start$/i }));

    // Step 1: select an answer, advance.
    expect(await screen.findByText("Where do you feel best?")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /on my own/i }));
    await user.click(screen.getByRole("button", { name: /^next$/i }));

    // Step 2: select multi, advance to review.
    expect(await screen.findByText("Indoor or outdoor?")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /indoor/i }));
    await user.click(screen.getByRole("button", { name: /^next$/i }));

    // Review: see results button visible and enabled.
    const seeResults = await screen.findByRole("button", { name: /see results/i });
    expect(seeResults).not.toBeDisabled();
    await user.click(seeResults);

    expect(pushMock).toHaveBeenCalledWith("/en/results");
    // Profile written to sessionStorage.
    const stored = sessionStorage.getItem("mq.quiz.profile.v1");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.tagScores).toEqual({ calm: 1, indoor: 1 });
  });

  it("Back from step 2 returns to step 1 with the selection preserved", async () => {
    renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^start$/i }));
    await user.click(screen.getByRole("radio", { name: /on my own/i }));
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    await screen.findByText("Indoor or outdoor?");
    await user.click(screen.getByRole("button", { name: /^back$/i }));
    expect(await screen.findByText("Where do you feel best?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /on my own/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("Restart confirms then wipes draft + lands on step 1 (constraint #43)", async () => {
    renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^start$/i }));
    await user.click(screen.getByRole("radio", { name: /on my own/i }));
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    await user.click(screen.getByRole("button", { name: /start over/i }));

    // Confirm dialog visible
    const confirm = await screen.findByRole("button", { name: /yes, start over/i });
    await user.click(confirm);

    // Lands directly on step 1 (RESTART → INIT → START)
    await waitFor(() =>
      expect(screen.getByText("Where do you feel best?")).toBeInTheDocument(),
    );
    // Prior selection wiped
    expect(screen.getByRole("radio", { name: /on my own/i })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(sessionStorage.getItem("mq.quiz.draft.v1")).toBeNull();
  });

  it("Cancel keeps the user on the current step with selection intact", async () => {
    renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^start$/i }));
    await user.click(screen.getByRole("radio", { name: /with one friend/i }));
    await user.click(screen.getByRole("button", { name: /start over/i }));
    await user.click(screen.getByRole("button", { name: /keep going/i }));
    expect(screen.getByRole("radio", { name: /with one friend/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("hydrates from sessionStorage on mount", async () => {
    sessionStorage.setItem(
      "mq.quiz.draft.v1",
      JSON.stringify({
        phase: "step",
        currentStepIndex: 1,
        answers: { q1: ["a"] },
        completedProfile: null,
      }),
    );
    renderApp();
    expect(await screen.findByText("Indoor or outdoor?")).toBeInTheDocument();
  });

  it("persists committed steps to sessionStorage on advance (commit-only, #41)", async () => {
    renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^start$/i }));
    await user.click(screen.getByRole("radio", { name: /on my own/i }));
    expect(sessionStorage.getItem("mq.quiz.draft.v1")).toBeNull();
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    await waitFor(() => expect(sessionStorage.getItem("mq.quiz.draft.v1")).not.toBeNull());
    const stored = JSON.parse(sessionStorage.getItem("mq.quiz.draft.v1")!);
    expect(stored.currentStepIndex).toBe(1);
    expect(stored.answers.q1).toEqual(["a"]);
  });

  it("Edit from review jumps to that step", async () => {
    renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^start$/i }));
    await user.click(screen.getByRole("radio", { name: /on my own/i }));
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    await user.click(screen.getByRole("checkbox", { name: /outdoor/i }));
    await user.click(screen.getByRole("button", { name: /^next$/i }));

    // On review now — click the first Edit button
    const editButtons = await screen.findAllByRole("button", { name: /^edit$/i });
    await user.click(editButtons[0]!);
    expect(await screen.findByText("Where do you feel best?")).toBeInTheDocument();
    // Selection preserved
    expect(screen.getByRole("radio", { name: /on my own/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
