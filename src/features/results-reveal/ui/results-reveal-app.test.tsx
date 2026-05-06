import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import enMatch from "../../../../messages/en/match.json";
import type { Activity } from "@/entities/activity";
import type { Archetype } from "@/entities/archetype";
import type { Tag } from "@/entities/tag";
import type { QuizProfile } from "@/entities/quiz-profile";

const computeSpy = vi.fn();

vi.mock("@/entities/match-result", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/match-result")>();
  return {
    ...actual,
    computeMatchResult: (
      ...args: Parameters<typeof actual.computeMatchResult>
    ): ReturnType<typeof actual.computeMatchResult> => {
      computeSpy(...args);
      return actual.computeMatchResult(...args);
    },
  };
});

const fixtureProfile: QuizProfile = {
  version: 1,
  tagScores: { calm: 3, focus: 2, indoor: 1, balance: 1 },
  answers: [],
};

vi.mock("@/features/quiz/model/storage", () => ({
  readProfile: () => fixtureProfile,
}));

import { ResultsRevealApp } from "./results-reveal-app";

const ARCHETYPES: Archetype[] = [
  {
    id: "calm-focus-mover",
    nameKey: "match.archetypes.calm-focus-mover.name",
    descriptionKey: "match.archetypes.calm-focus-mover.description",
    traitWeights: { calm: 3, focus: 3, balance: 2, indoor: 1 },
    recommendedActivityIds: ["yoga", "tai-chi"],
  },
  {
    id: "balance-rhythm-creator",
    nameKey: "match.archetypes.balance-rhythm-creator.name",
    descriptionKey: "match.archetypes.balance-rhythm-creator.description",
    traitWeights: { rhythm: 3, expression: 2, balance: 2 },
    recommendedActivityIds: ["dance", "ballet"],
  },
];

const ACTIVITIES: Activity[] = [
  {
    id: "yoga",
    ageRange: { min: 6, max: 25 },
    socialMode: ["solo", "instructor-led"],
    energy: ["low"],
    environment: ["indoor"],
    movementSkills: ["balance", "flexibility"],
    contactLevel: "none",
    costLevel: "low",
    equipmentLevel: "minimal",
    beginnerFriendliness: "high",
    seasonality: ["all"],
    nameKey: "match.activities.yoga.name",
    descriptionKey: "match.activities.yoga.description",
    tagAffinities: { calm: 3, focus: 2, balance: 2, flexibility: 2, indoor: 1 },
  },
  {
    id: "tai-chi",
    ageRange: { min: 8, max: 25 },
    socialMode: ["solo", "instructor-led"],
    energy: ["low"],
    environment: ["indoor", "outdoor"],
    movementSkills: ["balance", "flexibility"],
    contactLevel: "none",
    costLevel: "low",
    equipmentLevel: "none",
    beginnerFriendliness: "high",
    seasonality: ["all"],
    nameKey: "match.activities.tai-chi.name",
    descriptionKey: "match.activities.tai-chi.description",
    tagAffinities: { calm: 3, focus: 2, balance: 2 },
  },
];

const TAGS: Tag[] = [
  { id: "calm", category: "energy", nameKey: "match.tags.calm.name" },
  { id: "focus", category: "preference", nameKey: "match.tags.focus.name" },
  { id: "indoor", category: "environment", nameKey: "match.tags.indoor.name" },
  { id: "balance", category: "movement", nameKey: "match.tags.balance.name" },
  { id: "flexibility", category: "movement", nameKey: "match.tags.flexibility.name" },
  { id: "rhythm", category: "movement", nameKey: "match.tags.rhythm.name" },
  { id: "expression", category: "preference", nameKey: "match.tags.expression.name" },
];

function renderShell(onRestart: () => void = () => {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ match: enMatch }}>
      <ResultsRevealApp
        activities={ACTIVITIES}
        archetypes={ARCHETYPES}
        tags={TAGS}
        locale="en"
        onRestart={onRestart}
      />
    </NextIntlClientProvider>,
  );
}

describe("ResultsRevealApp", () => {
  beforeEach(() => {
    computeSpy.mockClear();
  });
  afterEach(() => {
    computeSpy.mockClear();
  });

  it("calls computeMatchResult exactly once for the initial render", async () => {
    renderShell();
    await waitFor(() => {
      expect(computeSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("renders the archetype phase by default with hero headline + main archetype card", async () => {
    renderShell();
    await waitFor(() => {
      expect(screen.getByText(enMatch.results.heroHeadline)).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { level: 2, name: enMatch.archetypes["calm-focus-mover"].name }),
    ).toBeInTheDocument();
  });

  it("renders zero activity names in the archetype phase (sport-name gate, constraint #55)", async () => {
    renderShell();
    await waitFor(() => {
      expect(screen.getByText(enMatch.results.revealCta)).toBeInTheDocument();
    });
    // None of the activity card names should be visible pre-reveal.
    expect(screen.queryByText(enMatch.activities.yoga.name)).toBeNull();
    expect(screen.queryByText(enMatch.activities["tai-chi"].name)).toBeNull();
  });

  it("phase toggle does NOT re-invoke computeMatchResult", async () => {
    renderShell();
    const user = userEvent.setup();
    await waitFor(() => {
      expect(computeSpy).toHaveBeenCalledTimes(1);
    });
    const initialCalls = computeSpy.mock.calls.length;
    await user.click(screen.getByRole("button", { name: enMatch.results.revealCta }));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: enMatch.results.activityGridHeading }),
      ).toBeInTheDocument();
    });
    expect(computeSpy).toHaveBeenCalledTimes(initialCalls);
  });

  it("focus shifts to the activity-grid heading after reveal (constraint #54)", async () => {
    renderShell();
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText(enMatch.results.revealCta)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: enMatch.results.revealCta }));
    await waitFor(() => {
      const heading = screen.getByRole("heading", {
        name: enMatch.results.activityGridHeading,
      });
      expect(document.activeElement).toBe(heading);
    });
  });

  it("activities phase renders activity cards with names", async () => {
    renderShell();
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText(enMatch.results.revealCta)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: enMatch.results.revealCta }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 3, name: enMatch.activities.yoga.name })).toBeInTheDocument();
    });
  });

  it("Start over button calls the onRestart prop", async () => {
    const onRestart = vi.fn();
    renderShell(onRestart);
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText(enMatch.results.revealCta)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: enMatch.results.restartButton }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
