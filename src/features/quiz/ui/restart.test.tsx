import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import enQuiz from "../../../../messages/en/quiz.json";

import { RestartConfirm } from "./restart";

function renderConfirm(overrides: Partial<React.ComponentProps<typeof RestartConfirm>> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <NextIntlClientProvider locale="en" messages={{ quiz: enQuiz }}>
      <RestartConfirm onConfirm={onConfirm} onCancel={onCancel} {...overrides} />
    </NextIntlClientProvider>,
  );
  return { onConfirm, onCancel };
}

describe("RestartConfirm", () => {
  it("renders confirm and cancel buttons from quiz.ui keys", () => {
    renderConfirm();
    expect(screen.getByRole("button", { name: /yes, start over/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /keep going/i })).toBeInTheDocument();
  });

  it("focuses cancel by default (destructive option must be deliberate)", () => {
    renderConfirm();
    expect(screen.getByRole("button", { name: /keep going/i })).toHaveFocus();
  });

  it("invokes onConfirm when the destructive button is pressed", async () => {
    const { onConfirm } = renderConfirm();
    await userEvent.click(screen.getByRole("button", { name: /yes, start over/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("invokes onCancel when keep-going is pressed", async () => {
    const { onCancel } = renderConfirm();
    await userEvent.click(screen.getByRole("button", { name: /keep going/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
