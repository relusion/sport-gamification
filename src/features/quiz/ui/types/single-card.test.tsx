import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SingleCard } from "./single-card";
import type { AnswerOption } from "./types";

const ANSWERS: AnswerOption[] = [
  { id: "a", label: "Quiet" },
  { id: "b", label: "With one friend" },
  { id: "c", label: "In a small group" },
];

const longRuLabel = "Очень длинная подпись на русском, чтобы проверить переносы и отсутствие nowrap";

function setup(value: string[] = []) {
  const onChange = vi.fn();
  render(
    <SingleCard
      questionId="q-1"
      prompt="Where do you feel best?"
      answers={ANSWERS}
      value={value}
      onChange={onChange}
    />,
  );
  return { onChange };
}

describe("SingleCard", () => {
  it("renders one radio per answer with selection state", () => {
    setup(["b"]);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
  });

  it("emits a single selection on click", async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByRole("radio", { name: /quiet/i }));
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("ArrowDown cycles focus to the next radio", async () => {
    setup();
    const radios = screen.getAllByRole("radio");
    radios[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(radios[1]).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(radios[0]).toHaveFocus();
  });

  it("ArrowUp wraps to the last radio", async () => {
    setup();
    const radios = screen.getAllByRole("radio");
    radios[0]!.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(radios[2]).toHaveFocus();
  });

  it("Enter selects the focused radio (native button semantics)", async () => {
    const { onChange } = setup();
    const radios = screen.getAllByRole("radio");
    radios[2]!.focus();
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(["c"]);
  });

  it("renders long-RU labels without nowrap on the option container", () => {
    render(
      <SingleCard
        questionId="q-1"
        prompt="Где тебе комфортнее всего?"
        answers={[{ id: "a", label: longRuLabel }]}
        value={[]}
        onChange={() => {}}
      />,
    );
    const radio = screen.getByRole("radio");
    expect(radio.className).not.toMatch(/whitespace-nowrap/);
    expect(radio).toHaveTextContent(longRuLabel);
  });
});
