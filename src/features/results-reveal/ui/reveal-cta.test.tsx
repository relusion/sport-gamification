import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { RevealCta } from "./reveal-cta";

describe("RevealCta", () => {
  it("renders the CTA label as a button", () => {
    render(<RevealCta label="Reveal activity ideas" subtitle="We'll show you a handful." onReveal={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Reveal activity ideas" }),
    ).toBeInTheDocument();
  });

  it("renders the subtitle alongside the button when provided", () => {
    render(<RevealCta label="Reveal" subtitle="Tap to see ideas." onReveal={() => {}} />);
    expect(screen.getByText("Tap to see ideas.")).toBeInTheDocument();
  });

  it("invokes onReveal when the button is activated via keyboard", async () => {
    const onReveal = vi.fn();
    render(<RevealCta label="Reveal" onReveal={onReveal} />);
    const btn = screen.getByRole("button", { name: "Reveal" });
    btn.focus();
    expect(btn).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onReveal).toHaveBeenCalledTimes(1);
  });

  it("invokes onReveal on click", async () => {
    const onReveal = vi.fn();
    render(<RevealCta label="Reveal" onReveal={onReveal} />);
    await userEvent.click(screen.getByRole("button", { name: "Reveal" }));
    expect(onReveal).toHaveBeenCalledTimes(1);
  });
});
