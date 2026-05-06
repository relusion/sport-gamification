import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WouldYouRatherCard } from "./would-you-rather-card";
import type { AnswerOption } from "./types";

const PAIR: AnswerOption[] = [
  { id: "left", label: "On a team" },
  { id: "right", label: "On your own" },
];

describe("WouldYouRatherCard", () => {
  it("renders exactly two radio options", () => {
    render(
      <WouldYouRatherCard
        questionId="q-wyr"
        prompt="Would you rather…"
        answers={PAIR}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("emits the selected answer id on click", async () => {
    const onChange = vi.fn();
    render(
      <WouldYouRatherCard
        questionId="q-wyr"
        prompt="Would you rather…"
        answers={PAIR}
        value={[]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("radio", { name: /on your own/i }));
    expect(onChange).toHaveBeenCalledWith(["right"]);
  });

  it("reflects the current selection via aria-checked", () => {
    render(
      <WouldYouRatherCard
        questionId="q-wyr"
        prompt="Would you rather…"
        answers={PAIR}
        value={["left"]}
        onChange={() => {}}
      />,
    );
    const [a, b] = screen.getAllByRole("radio");
    expect(a).toHaveAttribute("aria-checked", "true");
    expect(b).toHaveAttribute("aria-checked", "false");
  });
});
