import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { Button } from "./button";

const longRu = "Очень длинный текст для проверки переноса строки в кнопке";

describe("Button", () => {
  it("renders children and is keyboard-activatable", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press me</Button>);

    const button = screen.getByRole("button", { name: "Press me" });
    button.focus();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("applies primary variant by default and exposes a focus-ring class", () => {
    render(<Button>Hello</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toMatch(/bg-/);
    expect(button.className).toMatch(/focus-visible:/);
  });

  it("renders the long-RU label without truncation classes that would clip", () => {
    render(<Button>{longRu}</Button>);
    const button = screen.getByRole("button", { name: longRu });
    expect(button).toBeInTheDocument();
    // Defensive: the button must not silently truncate via white-space:nowrap
    // unless an explicit overflow strategy is in place.
    expect(button.className).not.toMatch(/whitespace-nowrap/);
  });

  it("supports the `secondary` and `ghost` variants", () => {
    const { rerender } = render(<Button variant="secondary">A</Button>);
    expect(screen.getByRole("button").className).toMatch(/border/);
    rerender(<Button variant="ghost">A</Button>);
    expect(screen.getByRole("button").className).toMatch(/bg-transparent/);
  });

  it("supports size variants and meets minimum hit target", () => {
    render(<Button size="lg">Big</Button>);
    const button = screen.getByRole("button");
    // size lg targets primary CTA — uses the 48px hit target
    expect(button.className).toMatch(/min-h-/);
  });

  it("forwards aria-* attributes", () => {
    render(<Button aria-label="Save profile">x</Button>);
    expect(screen.getByRole("button", { name: "Save profile" })).toBeInTheDocument();
  });
});
