import { describe, it, expect } from "vitest";

import { clearAll, QuizApp } from "./index";

describe("@/features/quiz barrel", () => {
  it("re-exports QuizApp as a function (component)", () => {
    expect(typeof QuizApp).toBe("function");
  });

  it("re-exports clearAll as a callable storage helper", () => {
    expect(typeof clearAll).toBe("function");
  });
});
