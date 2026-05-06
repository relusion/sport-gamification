import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SliderCard } from "./slider-card";
import type { AnswerOption } from "./types";

const STOPS: AnswerOption[] = [
  { id: "s0", label: "Calm" },
  { id: "s1", label: "Steady" },
  { id: "s2", label: "Energetic" },
  { id: "s3", label: "Wild" },
];

describe("SliderCard", () => {
  it("renders a slider with an accessible name (constraint #32)", () => {
    render(
      <SliderCard
        questionId="q-energy"
        prompt="Energy?"
        answers={STOPS}
        value={["s1"]}
        onChange={() => {}}
      />,
    );
    // Radix puts aria-label on the Thumb (role=slider), where RTL queries it.
    expect(screen.getByRole("slider", { name: /energy\?/i })).toBeInTheDocument();
  });

  it("commits an answer id when the slider value changes via keyboard", async () => {
    const onChange = vi.fn();
    render(
      <SliderCard
        questionId="q-energy"
        prompt="Energy?"
        answers={STOPS}
        value={["s1"]}
        onChange={onChange}
      />,
    );
    const slider = screen.getByRole("slider", { name: /energy/i });
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(["s2"]);
  });

  it("highlights the current stop label", () => {
    render(
      <SliderCard
        questionId="q-energy"
        prompt="Energy?"
        answers={STOPS}
        value={["s2"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Energetic", { selector: "span" }).className).toMatch(/font-medium/);
  });

  it("falls back to the middle stop when no value is committed yet", () => {
    render(
      <SliderCard
        questionId="q-energy"
        prompt="Energy?"
        answers={STOPS}
        value={[]}
        onChange={() => {}}
      />,
    );
    // 4 stops → middle index = floor(4/2) = 2 → "Energetic"
    expect(screen.getByText("Energetic", { selector: "span" }).className).toMatch(/font-medium/);
  });
});
