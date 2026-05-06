import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Card, CardHeader, CardBody, CardFooter } from "./card";

const longRu = "Очень длинный заголовок карточки для проверки переноса строки";

describe("Card", () => {
  it("renders header, body, and footer slots in order", () => {
    render(
      <Card data-testid="card">
        <CardHeader>head</CardHeader>
        <CardBody>body</CardBody>
        <CardFooter>foot</CardFooter>
      </Card>,
    );
    const card = screen.getByTestId("card");
    const text = card.textContent ?? "";
    expect(text.indexOf("head")).toBeLessThan(text.indexOf("body"));
    expect(text.indexOf("body")).toBeLessThan(text.indexOf("foot"));
  });

  it("renders the long-RU title without nowrap (constraint #8)", () => {
    render(
      <Card data-testid="card">
        <CardHeader>{longRu}</CardHeader>
      </Card>,
    );
    const header = screen.getByText(longRu);
    expect(header.className).not.toMatch(/whitespace-nowrap/);
  });

  it("supports the gradient variant via class", () => {
    render(
      <Card data-testid="card" variant="gradient">
        <CardBody>x</CardBody>
      </Card>,
    );
    expect(screen.getByTestId("card").className).toMatch(/bg-gradient/);
  });

  it("preserves arbitrary props (data-*, role)", () => {
    render(
      <Card role="region" aria-label="Hero" data-testid="card">
        <CardBody>x</CardBody>
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Hero" })).toBeInTheDocument();
  });
});
