import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import enQuiz from "../../../../messages/en/quiz.json";
import ruQuiz from "../../../../messages/ru/quiz.json";

import { MovementMap } from "./movement-map";
import type { QuestionArea } from "@/entities/question";

function renderWithLocale(locale: "en" | "ru", lit: ReadonlySet<QuestionArea>) {
  const messages = { quiz: locale === "en" ? enQuiz : ruQuiz };
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <MovementMap litAreas={lit} />
    </NextIntlClientProvider>,
  );
}

describe("MovementMap", () => {
  it("renders one badge per area in EN", () => {
    renderWithLocale("en", new Set());
    for (const label of ["Social", "Energy", "Environment", "Movement", "Contact", "Preference", "Practical"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders localized labels in RU", () => {
    renderWithLocale("ru", new Set());
    expect(screen.getByText("Компания")).toBeInTheDocument();
    expect(screen.getByText("Окружение")).toBeInTheDocument();
  });

  it("a lit area pairs a non-color signal — Badge's built-in check glyph (#11)", () => {
    const { container } = renderWithLocale("en", new Set(["movement"]));
    // The Badge with tone="success" is the only one carrying its check glyph SVG;
    // unlit Badges render a neutral tone with no glyph.
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(1);
  });

  it("aria-label encodes the lit/unlit state for screen readers", () => {
    renderWithLocale("en", new Set(["energy"]));
    const lit = screen.getByLabelText(/Energy — Answered/);
    expect(lit).toBeInTheDocument();
    const unlit = screen.getByLabelText(/Social — Not yet/);
    expect(unlit).toBeInTheDocument();
  });

  it("uses no fixed width / nowrap on the labels container (constraint #6)", () => {
    const { container } = renderWithLocale("en", new Set());
    const list = container.querySelector("ul")!;
    expect(list.className).not.toMatch(/whitespace-nowrap/);
    expect(list.className).not.toMatch(/w-\d+/);
  });
});
