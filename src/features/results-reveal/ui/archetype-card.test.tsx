import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ArchetypeCard } from "./archetype-card";

describe("ArchetypeCard", () => {
  it("renders name, description, and flavor as resolved-string props", () => {
    render(
      <ArchetypeCard
        name="Outdoor Endurance Adventurer"
        description="You feel best on long trails and open paths."
        flavor="Big sky, long miles, easy mind."
      />,
    );
    expect(screen.getByText("Outdoor Endurance Adventurer")).toBeInTheDocument();
    expect(
      screen.getByText("You feel best on long trails and open paths."),
    ).toBeInTheDocument();
    expect(screen.getByText("Big sky, long miles, easy mind.")).toBeInTheDocument();
  });

  it("uses Card with the gradient variant", () => {
    const { container } = render(
      <ArchetypeCard name="X" description="y" flavor="z" />,
    );
    // Gradient variant adds the brand-soft → surface gradient classes.
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/from-/);
  });

  it("renders the neutral-activity SVG fallback icon (post-MVP per-archetype icons deferred)", () => {
    const { container } = render(
      <ArchetypeCard name="X" description="y" flavor="z" />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("the name is the level-2 region heading (level-1 is the page hero)", () => {
    render(<ArchetypeCard name="Strategy Mover" description="d" flavor="f" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Strategy Mover" }),
    ).toBeInTheDocument();
  });

  it("tolerates a long Russian description without nowrap", () => {
    const longRu =
      "Ты лучше всего чувствуешь себя на длинных тропах и открытых путях — в ровном движении и спокойном дыхании.";
    const { container } = render(
      <ArchetypeCard name="X" description={longRu} flavor="z" />,
    );
    expect(screen.getByText(longRu)).toBeInTheDocument();
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toMatch(/whitespace-nowrap/);
  });
});
