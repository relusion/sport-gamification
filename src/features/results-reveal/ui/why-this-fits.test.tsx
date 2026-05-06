import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { WhyThisFits } from "./why-this-fits";

describe("WhyThisFits", () => {
  it("renders nothing when there are zero tag names", () => {
    const { container } = render(<WhyThisFits heading="Why this fits you" tagNames={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders heading + up to 3 tag names as bullets", () => {
    render(
      <WhyThisFits
        heading="Why this fits you"
        tagNames={["Outdoor", "Endurance", "Calm"]}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Why this fits you" })).toBeInTheDocument();
    expect(screen.getByText("Outdoor")).toBeInTheDocument();
    expect(screen.getByText("Endurance")).toBeInTheDocument();
    expect(screen.getByText("Calm")).toBeInTheDocument();
  });
});
