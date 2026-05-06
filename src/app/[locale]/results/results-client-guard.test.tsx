import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResultsClientGuard } from "./results-client-guard";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, back: vi.fn() }),
}));

describe("ResultsClientGuard", () => {
  beforeEach(() => {
    sessionStorage.clear();
    replaceMock.mockClear();
  });
  afterEach(() => sessionStorage.clear());

  it("redirects to /[locale]/quiz when no profile is stored", async () => {
    render(<ResultsClientGuard locale="en" />);
    // useEffect is sync in test
    expect(replaceMock).toHaveBeenCalledWith("/en/quiz");
  });

  it("redirects when stored profile fails schema (version drift)", () => {
    sessionStorage.setItem("mq.quiz.profile.v1", JSON.stringify({ version: 99 }));
    render(<ResultsClientGuard locale="ru" />);
    expect(replaceMock).toHaveBeenCalledWith("/ru/quiz");
  });

  it("does NOT redirect when a valid profile is present", () => {
    sessionStorage.setItem(
      "mq.quiz.profile.v1",
      JSON.stringify({
        version: 1,
        tagScores: { calm: 1 },
        answers: [{ questionId: "q-1", answerIds: ["a"] }],
      }),
    );
    render(<ResultsClientGuard locale="en" />);
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
