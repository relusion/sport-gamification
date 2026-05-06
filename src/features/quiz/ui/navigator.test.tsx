import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import enQuiz from "../../../../messages/en/quiz.json";

import { Navigator } from "./navigator";

const NOOP = () => {};

function renderNav(overrides: Partial<React.ComponentProps<typeof Navigator>> = {}) {
  const onBack = vi.fn();
  const onNext = vi.fn();
  const onRestart = vi.fn();
  const props: React.ComponentProps<typeof Navigator> = {
    stepNumber: 1,
    total: 12,
    canGoBack: true,
    canGoNext: true,
    onBack,
    onNext,
    onRestart,
    ...overrides,
  };
  render(
    <NextIntlClientProvider locale="en" messages={{ quiz: enQuiz }}>
      <Navigator {...props} />
    </NextIntlClientProvider>,
  );
  return { onBack, onNext, onRestart };
}

describe("Navigator", () => {
  it("renders back, restart, and next from the quiz namespace", () => {
    renderNav();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start over" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("invokes the right handlers on click", async () => {
    const { onBack, onNext, onRestart } = renderNav();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("Next is disabled and aria-disabled when canGoNext is false (constraint #11)", () => {
    renderNav({ canGoNext: false, onBack: NOOP, onNext: NOOP, onRestart: NOOP });
    const next = screen.getByRole("button", { name: "Next" });
    expect(next).toBeDisabled();
    expect(next).toHaveAttribute("aria-disabled", "true");
  });

  it("Back is disabled when canGoBack is false", () => {
    renderNav({ canGoBack: false, onBack: NOOP, onNext: NOOP, onRestart: NOOP });
    const back = screen.getByRole("button", { name: "Back" });
    expect(back).toBeDisabled();
  });

  it("nextLabel override replaces the Next copy (used on Review)", () => {
    renderNav({ nextLabel: "See results" });
    expect(screen.getByRole("button", { name: "See results" })).toBeInTheDocument();
  });

  it("renders a ProgressBar with an accessible name", () => {
    renderNav({ stepNumber: 4, total: 12 });
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "Progress: 4 of 12 answered",
    );
  });
});
