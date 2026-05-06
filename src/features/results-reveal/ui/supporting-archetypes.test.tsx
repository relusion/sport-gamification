import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { SupportingArchetypes } from "./supporting-archetypes";

describe("SupportingArchetypes", () => {
  it("renders nothing for the 0-secondaries branch", () => {
    const { container } = render(
      <SupportingArchetypes heading="You also lean toward" secondaries={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one card for the 1-secondary branch", () => {
    render(
      <SupportingArchetypes
        heading="You also lean toward"
        secondaries={[{ id: "calm-focus-mover", name: "Calm & Focus Mover", flavor: "Steady breath." }]}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "You also lean toward" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Calm & Focus Mover" })).toBeInTheDocument();
    expect(screen.getByText("Steady breath.")).toBeInTheDocument();
  });

  it("renders two side-by-side cards for the 2-secondary branch", () => {
    render(
      <SupportingArchetypes
        heading="You also lean toward"
        secondaries={[
          { id: "a", name: "Alpha", flavor: "fa" },
          { id: "b", name: "Bravo", flavor: "fb" },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Bravo" })).toBeInTheDocument();
    expect(screen.getByText("fa")).toBeInTheDocument();
    expect(screen.getByText("fb")).toBeInTheDocument();
  });
});
