import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { TraitBars } from "./trait-bars";
import type { TraitBar } from "../lib/derive-trait-bars";

const FIXTURE: ReadonlyArray<TraitBar & { label: string }> = [
  { component: "preference_fit", weight: 0.2, label: "Preferences" },
  { component: "environment_fit", weight: 0.4, label: "Environment" },
  { component: "social_fit", weight: 1, label: "Social style" },
  { component: "confidence_fit", weight: 0.6, label: "Confidence" },
  { component: "practical_fit", weight: 0, label: "Practical fit" },
];

describe("TraitBars", () => {
  it("renders exactly 5 ProgressBar elements (one per ComponentName)", () => {
    render(<TraitBars bars={FIXTURE} sectionLabel="Your movement style" />);
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(5);
  });

  it("each ProgressBar has its component label as accessible name", () => {
    render(<TraitBars bars={FIXTURE} sectionLabel="Your movement style" />);
    expect(screen.getByRole("progressbar", { name: "Preferences" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Practical fit" })).toBeInTheDocument();
  });

  it("renders the localized text label next to each bar", () => {
    render(<TraitBars bars={FIXTURE} sectionLabel="Your movement style" />);
    expect(screen.getByText("Preferences")).toBeInTheDocument();
    expect(screen.getByText("Social style")).toBeInTheDocument();
  });

  it("ARIA values reflect the 0..1 weight (mapped to 0..100)", () => {
    render(<TraitBars bars={FIXTURE} sectionLabel="Your movement style" />);
    const social = screen.getByRole("progressbar", { name: "Social style" });
    expect(social).toHaveAttribute("aria-valuenow", "100");
    const practical = screen.getByRole("progressbar", { name: "Practical fit" });
    expect(practical).toHaveAttribute("aria-valuenow", "0");
  });

  it("section is labelled by the sectionLabel prop", () => {
    render(<TraitBars bars={FIXTURE} sectionLabel="Your movement style" />);
    expect(screen.getByRole("region", { name: "Your movement style" })).toBeInTheDocument();
  });
});
