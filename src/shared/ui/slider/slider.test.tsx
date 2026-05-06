import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { Slider } from "./slider";

describe("Slider", () => {
  it("renders a slider role with ARIA preserved", () => {
    render(
      <Slider aria-label="Energy level" defaultValue={[5]} min={0} max={10} step={1} />,
    );
    const slider = screen.getByRole("slider", { name: "Energy level" });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "10");
    expect(slider).toHaveAttribute("aria-valuenow", "5");
  });

  it("changes value with arrow keys (keyboard nav, constraint #10)", async () => {
    const onChange = vi.fn();
    render(
      <Slider
        aria-label="Energy level"
        defaultValue={[5]}
        min={0}
        max={10}
        step={1}
        onValueChange={onChange}
      />,
    );
    const slider = screen.getByRole("slider", { name: "Energy level" });
    slider.focus();
    expect(slider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith([6]);
    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith([4]);
  });

  it("supports range mode (two thumbs)", () => {
    render(
      <Slider aria-label="Range" defaultValue={[2, 8]} min={0} max={10} step={1} />,
    );
    const thumbs = screen.getAllByRole("slider");
    expect(thumbs).toHaveLength(2);
  });

  it("accepts a long-RU aria-label (constraint #8)", () => {
    const label = "Очень длинный заголовок ползунка для проверки переноса";
    render(<Slider aria-label={label} defaultValue={[5]} min={0} max={10} />);
    expect(screen.getByRole("slider", { name: label })).toBeInTheDocument();
  });
});
