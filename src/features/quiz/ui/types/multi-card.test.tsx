import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MultiCard } from "./multi-card";
import type { AnswerOption } from "./types";

const ANSWERS: AnswerOption[] = [
  { id: "a", label: "Indoor" },
  { id: "b", label: "Outdoor" },
  { id: "c", label: "Either" },
];

describe("MultiCard", () => {
  it("renders one checkbox per answer; reflects current value", () => {
    render(
      <MultiCard
        questionId="q-1"
        prompt="Where?"
        answers={ANSWERS}
        value={["a", "c"]}
        onChange={() => {}}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes[0]).toHaveAttribute("aria-checked", "true");
    expect(checkboxes[1]).toHaveAttribute("aria-checked", "false");
    expect(checkboxes[2]).toHaveAttribute("aria-checked", "true");
  });

  it("toggles a selection on click (adds when off)", async () => {
    const onChange = vi.fn();
    render(
      <MultiCard
        questionId="q-1"
        prompt="Where?"
        answers={ANSWERS}
        value={["a"]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: /outdoor/i }));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("removes a selection on click (toggles when on)", async () => {
    const onChange = vi.fn();
    render(
      <MultiCard
        questionId="q-1"
        prompt="Where?"
        answers={ANSWERS}
        value={["a", "b"]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: /indoor/i }));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("pairs a non-color glyph with the selected state (constraint #11)", () => {
    render(
      <MultiCard
        questionId="q-1"
        prompt="Where?"
        answers={ANSWERS}
        value={["a"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("checkbox", { name: /indoor/i })).toHaveTextContent("✓");
  });
});
