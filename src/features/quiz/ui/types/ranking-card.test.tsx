import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RankingCard } from "./ranking-card";
import type { AnswerOption } from "./types";

const ITEMS: AnswerOption[] = [
  { id: "speed", label: "Speed" },
  { id: "skill", label: "Skill" },
  { id: "stamina", label: "Stamina" },
  { id: "creativity", label: "Creativity" },
];

function setup(initialValue: string[] = []) {
  const onChange = vi.fn();
  render(
    <RankingCard
      questionId="q-rank"
      prompt="Rank what matters most"
      answers={ITEMS}
      value={initialValue}
      onChange={onChange}
    />,
  );
  return { onChange };
}

function rowsInOrder() {
  return screen.getAllByRole("listitem");
}

function rowText(li: HTMLElement) {
  return within(li).getAllByText(/.+/).map((n) => n.textContent).join(" ");
}

describe("RankingCard", () => {
  it("renders one list row per item with a position number (constraint #11 — no color-only)", () => {
    setup();
    const rows = rowsInOrder();
    expect(rows).toHaveLength(4);
    expect(rowText(rows[0]!)).toMatch(/1.*Speed/);
    expect(rowText(rows[3]!)).toMatch(/4.*Creativity/);
  });

  it("renders explicit Move up / Move down buttons per row (mouse + touch parity)", () => {
    setup();
    expect(screen.getAllByRole("button", { name: /^Move .* up$/ })).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: /^Move .* down$/ })).toHaveLength(4);
  });

  it("first row's Move up button is disabled; last row's Move down is disabled", () => {
    setup();
    expect(screen.getByRole("button", { name: "Move Speed up" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move Creativity down" }),
    ).toBeDisabled();
  });

  it("emits the authored order on first mount when value is empty", () => {
    const { onChange } = setup();
    expect(onChange).toHaveBeenCalledWith(["speed", "skill", "stamina", "creativity"]);
  });

  it("clicking Move down on the first item swaps it with the second", async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Move Speed down" }));
    const rows = rowsInOrder();
    expect(rowText(rows[0]!)).toMatch(/Skill/);
    expect(rowText(rows[1]!)).toMatch(/Speed/);
    expect(onChange).toHaveBeenLastCalledWith([
      "skill",
      "speed",
      "stamina",
      "creativity",
    ]);
  });

  it("clicking Move up on the last item swaps it with the third", async () => {
    const { onChange } = setup();
    onChange.mockClear();
    await userEvent.click(screen.getByRole("button", { name: "Move Creativity up" }));
    const rows = rowsInOrder();
    expect(rowText(rows[2]!)).toMatch(/Creativity/);
    expect(rowText(rows[3]!)).toMatch(/Stamina/);
    expect(onChange).toHaveBeenLastCalledWith([
      "speed",
      "skill",
      "creativity",
      "stamina",
    ]);
  });

  it("ArrowDown on the first row's down button still reorders (keyboard parity)", async () => {
    const { onChange } = setup();
    onChange.mockClear();
    screen.getByRole("button", { name: "Move Speed down" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith([
      "skill",
      "speed",
      "stamina",
      "creativity",
    ]);
  });

  it("after a move, focus follows the moved item to its new position", async () => {
    setup();
    const downBtn = screen.getByRole("button", { name: "Move Speed down" });
    await userEvent.click(downBtn);
    // 'Speed' is now at position 1 — the down button at index 1 should hold focus.
    expect(screen.getByRole("button", { name: "Move Speed down" })).toHaveFocus();
  });

  it("respects a valid prior full ordering on remount", () => {
    setup(["creativity", "skill", "speed", "stamina"]);
    const rows = rowsInOrder();
    expect(rowText(rows[0]!)).toMatch(/Creativity/);
    expect(rowText(rows[3]!)).toMatch(/Stamina/);
  });

  it("aria-label on each row exposes the position and reorder hint", () => {
    setup();
    const first = rowsInOrder()[0]!;
    expect(first.getAttribute("aria-label")).toMatch(/^Rank 1: Speed/);
    expect(first.getAttribute("aria-label")).toMatch(/arrow up or arrow down/i);
  });
});
