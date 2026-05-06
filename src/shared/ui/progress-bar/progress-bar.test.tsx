import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("renders progressbar role with correct ARIA", () => {
    render(<ProgressBar value={40} max={100} aria-label="Quiz progress" />);
    const bar = screen.getByRole("progressbar", { name: "Quiz progress" });
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("includes a transition class so prefers-reduced-motion can disable it via global rules", () => {
    const { container } = render(
      <ProgressBar value={50} max={100} aria-label="Quiz progress" />,
    );
    const indicator = container.querySelector('[data-slot="indicator"]');
    expect(indicator?.className).toMatch(/transition/);
  });

  it("clamps value into [0, max]", () => {
    render(<ProgressBar value={150} max={100} aria-label="Quiz progress" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
  });

  it("supports indeterminate state with a non-color visual signal (constraint #13)", () => {
    const { container } = render(
      <ProgressBar value={null} max={100} aria-label="Loading" />,
    );
    const bar = screen.getByRole("progressbar");
    // Radix omits aria-valuenow when state is indeterminate.
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
    // The Root sets data-state too; restrict to the inner indicator slot.
    const indicator = container.querySelector('[data-slot="indicator"]');
    expect(indicator, "indeterminate indicator must render a moving stripe").not.toBeNull();
    expect(indicator?.className).toMatch(/animate-/);
  });

  it("accepts a long-RU aria-label (constraint #8)", () => {
    const label = "Очень длинный заголовок индикатора прогресса";
    render(<ProgressBar value={50} max={100} aria-label={label} />);
    expect(screen.getByRole("progressbar", { name: label })).toBeInTheDocument();
  });
});
