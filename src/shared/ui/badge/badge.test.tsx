import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Badge } from "./badge";

const longRu = "Очень длинная подпись для бейджа";

describe("Badge", () => {
  it("renders the label as visible text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("includes an icon companion for status variants (no color-only signal, constraint #13)", () => {
    const variants = ["success", "warning", "danger", "info"] as const;
    for (const v of variants) {
      const { container, unmount } = render(<Badge tone={v}>state</Badge>);
      const svg = container.querySelector("svg");
      expect(svg, `${v} variant must render an icon companion`).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
      unmount();
    }
  });

  it("renders long-RU label without nowrap on the outer container", () => {
    render(<Badge data-testid="badge">{longRu}</Badge>);
    expect(screen.getByTestId("badge").className).not.toMatch(/whitespace-nowrap/);
  });

  it("forwards aria-label", () => {
    render(<Badge aria-label="Privacy badge">P</Badge>);
    expect(screen.getByLabelText("Privacy badge")).toBeInTheDocument();
  });
});
