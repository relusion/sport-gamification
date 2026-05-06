import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { ResultsActions } from "./results-actions";

describe("ResultsActions", () => {
  it("renders the Start over button and Review my answers link", () => {
    render(
      <ResultsActions
        restartLabel="Start over"
        reviewLabel="Review my answers"
        reviewHref="/en/quiz"
        onRestart={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Start over" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Review my answers" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/en/quiz");
  });

  it("calls onRestart when Start over is clicked", async () => {
    const onRestart = vi.fn();
    render(
      <ResultsActions
        restartLabel="Start over"
        reviewLabel="Review"
        reviewHref="/en/quiz"
        onRestart={onRestart}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
