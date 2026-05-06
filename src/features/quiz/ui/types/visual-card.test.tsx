import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { VisualCard } from "./visual-card";
import type { AnswerOption } from "./types";

const ANSWERS: AnswerOption[] = [
  { id: "calm", label: "Calm" },
  { id: "burst", label: "Burst" },
  { id: "outdoor", label: "Outdoor" },
];

describe("VisualCard", () => {
  it("renders an SVG icon paired with each label (constraint #11, #48)", () => {
    const { container } = render(
      <VisualCard
        questionId="q-vis"
        prompt="What feels right?"
        answers={ANSWERS}
        value={[]}
        onChange={() => {}}
      />,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(ANSWERS.length);
    for (const svg of Array.from(svgs)) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("single-select mode: emits one id and uses radio role", async () => {
    const onChange = vi.fn();
    render(
      <VisualCard
        questionId="q-vis"
        prompt="Pick one"
        answers={ANSWERS}
        value={[]}
        onChange={onChange}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    await userEvent.click(screen.getByRole("radio", { name: /burst/i }));
    expect(onChange).toHaveBeenCalledWith(["burst"]);
  });

  it("multi-select mode: toggles items and uses checkbox role", async () => {
    const onChange = vi.fn();
    render(
      <VisualCard
        questionId="q-vis"
        prompt="Pick any"
        answers={ANSWERS}
        value={["calm"]}
        onChange={onChange}
        multi
      />,
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    await userEvent.click(screen.getByRole("checkbox", { name: /outdoor/i }));
    expect(onChange).toHaveBeenCalledWith(["calm", "outdoor"]);
  });

  it("falls back to a neutral icon when answer.id is not in the registry", () => {
    const { container } = render(
      <VisualCard
        questionId="q-vis"
        prompt="?"
        answers={[{ id: "totally-unregistered-id", label: "Mystery" }]}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
