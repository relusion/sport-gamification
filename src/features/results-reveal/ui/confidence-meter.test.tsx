import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ConfidenceMeter } from "./confidence-meter";

describe("ConfidenceMeter", () => {
  it("renders the localized text label always", () => {
    render(<ConfidenceMeter label="Easy to start" active={true} />);
    expect(screen.getByText("Easy to start")).toBeInTheDocument();
  });

  it("active=true renders a check glyph alongside the text (icon + text, never color alone)", () => {
    const { container } = render(<ConfidenceMeter label="Easy to start" active={true} />);
    expect(container.querySelector('[data-state="active"] svg')).not.toBeNull();
    expect(screen.getByText("Easy to start")).toBeInTheDocument();
  });

  it("active=false renders a dash glyph alongside the text", () => {
    const { container } = render(<ConfidenceMeter label="Easy to start" active={false} />);
    expect(container.querySelector('[data-state="inactive"] svg')).not.toBeNull();
    expect(screen.getByText("Easy to start")).toBeInTheDocument();
  });

  it("aria-label encodes the active/inactive state for screen readers", () => {
    render(<ConfidenceMeter label="Easy to start" active={true} />);
    const node = screen.getByLabelText(/Easy to start.*✓|Easy to start.*yes/i, { exact: false });
    expect(node).toBeInTheDocument();
  });
});
