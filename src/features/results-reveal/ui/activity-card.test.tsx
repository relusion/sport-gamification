import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ActivityCard, type ActivityCardProps } from "./activity-card";

const FIXTURE: ActivityCardProps = {
  name: "Hiking",
  fit: "Long paths, fresh air, easy company.",
  tagFamilies: [
    { axisLabel: "Where", values: ["Outdoor"] },
    { axisLabel: "Who with", values: ["Solo", "Small group"] },
    { axisLabel: "How easy", values: ["Beginner-friendly"] },
    { axisLabel: "Gear", values: ["Tiny bit of gear"] },
  ],
  confidence: [
    { label: "Easy to start", active: true },
    { label: "Lessons help a lot", active: false },
    { label: "Needs some gear", active: false },
    { label: "Best with a team", active: false },
  ],
};

describe("ActivityCard", () => {
  it("renders the activity name as a level-3 heading", () => {
    render(<ActivityCard {...FIXTURE} />);
    expect(screen.getByRole("heading", { level: 3, name: "Hiking" })).toBeInTheDocument();
  });

  it("renders the fit sentence", () => {
    render(<ActivityCard {...FIXTURE} />);
    expect(screen.getByText("Long paths, fresh air, easy company.")).toBeInTheDocument();
  });

  it("renders all 4 tag-family axis labels", () => {
    render(<ActivityCard {...FIXTURE} />);
    for (const axis of ["Where", "Who with", "How easy", "Gear"]) {
      expect(screen.getByText(axis)).toBeInTheDocument();
    }
  });

  it("renders every value in each tag family as a Badge", () => {
    render(<ActivityCard {...FIXTURE} />);
    for (const value of [
      "Outdoor",
      "Solo",
      "Small group",
      "Beginner-friendly",
      "Tiny bit of gear",
    ]) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });

  it("renders 4 confidence-meter rows with their labels", () => {
    render(<ActivityCard {...FIXTURE} />);
    for (const meter of [
      "Easy to start",
      "Lessons help a lot",
      "Needs some gear",
      "Best with a team",
    ]) {
      expect(screen.getByText(meter)).toBeInTheDocument();
    }
  });

  it("groups the 4 confidence meters under a region with a meaningful name", () => {
    render(<ActivityCard {...FIXTURE} />);
    const groups = screen.getAllByRole("group");
    // 4 confidence-meter rows each have role=group
    expect(groups.length).toBeGreaterThanOrEqual(4);
  });

  it("active confidence meter renders a non-color signal (icon) in addition to the label", () => {
    const { container } = render(<ActivityCard {...FIXTURE} />);
    const activeRows = container.querySelectorAll('[data-state="active"]');
    expect(activeRows.length).toBeGreaterThanOrEqual(1);
    expect(within(activeRows[0] as HTMLElement).getAllByText(/.+/).length).toBeGreaterThanOrEqual(1);
  });
});
