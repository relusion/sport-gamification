import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ActivityGrid } from "./activity-grid";
import type { ActivityCardProps } from "./activity-card";

function card(name: string, fit: string): ActivityCardProps {
  return {
    name,
    fit,
    tagFamilies: [
      { axisLabel: "Where", values: ["Outdoor"] },
      { axisLabel: "Who with", values: ["Solo"] },
      { axisLabel: "How easy", values: ["Beginner-friendly"] },
      { axisLabel: "Gear", values: ["No gear"] },
    ],
    confidence: [
      { label: "Easy to start", active: true },
      { label: "Lessons help a lot", active: false },
      { label: "Needs some gear", active: false },
      { label: "Best with a team", active: false },
    ],
  };
}

describe("ActivityGrid", () => {
  it("renders the heading and one ActivityCard per ranked activity", () => {
    render(
      <ActivityGrid
        heading="Activities to try"
        cards={[card("Hiking", "fit1"), card("Running", "fit2"), card("Cycling", "fit3")]}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Activities to try" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Hiking" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Running" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Cycling" })).toBeInTheDocument();
  });

  it("forwards a ref to the heading so the shell can shift focus on phase change", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <ActivityGrid
        heading="Activities to try"
        cards={[card("Hiking", "fit1")]}
        headingRef={ref}
      />,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("H2");
  });

  it("heading is keyboard-focusable (tabIndex=-1) so the shell's focus() call lands", () => {
    render(<ActivityGrid heading="Activities" cards={[card("Hiking", "f")]} />);
    const heading = screen.getByRole("heading", { level: 2, name: "Activities" });
    expect(heading).toHaveAttribute("tabindex", "-1");
  });
});
