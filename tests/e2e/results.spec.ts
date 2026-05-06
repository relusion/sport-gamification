import { test, expect, type Page, type Request } from "@playwright/test";

/**
 * Console-error / pageerror guard (constraint #32). Without it, a CSP
 * regression on /results can ship green because the page still navigates.
 */
function attachConsoleErrorGuard(page: Page, errors: string[]) {
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[console.error] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
}

function attachOriginGuard(page: Page, ownOrigin: string, offending: string[]) {
  const recordRequest = (req: Request) => {
    const url = req.url();
    if (url.startsWith("data:") || url.startsWith("blob:")) return;
    const origin = new URL(url).origin;
    if (origin !== ownOrigin) offending.push(url);
  };
  page.on("request", recordRequest);
}

/**
 * Stable persona — the `balanced` fixture from 03's snapshot suite.
 * Mirrors `src/entities/match-result/model/__fixtures__/personas.ts`.
 */
const STABLE_PERSONA = {
  version: 1 as const,
  tagScores: {
    social: 2,
    team: 2,
    energy: 2,
    burst: 1,
    outdoor: 2,
    indoor: 2,
    freeform: 2,
    structured: 2,
    endurance: 2,
    expression: 1,
    focus: 2,
    calm: 2,
    morning: 1,
    evening: 1,
    practical: 2,
  },
  answers: [],
};

const PROFILE_KEY = "mq.quiz.profile.v1";
const DRAFT_KEY = "mq.quiz.draft.v1";

async function seedProfile(page: Page, baseURL: string, persona = STABLE_PERSONA) {
  // Storage is origin-scoped — load any same-origin page first to expose
  // sessionStorage, then seed the profile and reload into /results.
  await page.goto(`${baseURL}/en/quiz`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ key, value }) => {
      sessionStorage.setItem(key, value);
    },
    { key: PROFILE_KEY, value: JSON.stringify(persona) },
  );
}

const HERO_HEADLINE_EN = "Here is your movement style";
const HERO_HEADLINE_RU = "Вот твой стиль движения";
const REVEAL_CTA_EN = "Reveal activity ideas";
const REVEAL_CTA_RU = "Показать идеи занятий";
const ACTIVITY_GRID_HEADING_EN = "Activities to try";
const ACTIVITY_GRID_HEADING_RU = "Чем стоит заняться";
const RESTART_EN = "Start over";
const REVIEW_EN = "Review my answers";

test.describe("Results page", () => {
  test("redirects /en/results → /en/quiz when no profile is stored (constraint #34)", async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto("/en/results");
    await page.waitForURL(/\/en\/quiz$/);
    expect(page.url()).toMatch(/\/en\/quiz$/);
  });

  test("EN golden path: archetype phase renders, no console / pageerror, no foreign origins", async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) throw new Error("baseURL must be set");
    const errors: string[] = [];
    const offending: string[] = [];
    attachConsoleErrorGuard(page, errors);
    attachOriginGuard(page, new URL(baseURL).origin, offending);

    await seedProfile(page, baseURL);
    await page.goto(`${baseURL}/en/results`, { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", { level: 1, name: HERO_HEADLINE_EN }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: REVEAL_CTA_EN })).toBeVisible();

    expect(errors, `console / pageerror: ${errors.join("\n")}`).toEqual([]);
    expect(offending, `non-own-origin: ${offending.join(", ")}`).toEqual([]);
  });

  test("EN reveal phase transition: clicking the CTA reveals activities and shifts focus", async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) throw new Error("baseURL must be set");
    await seedProfile(page, baseURL);
    await page.goto(`${baseURL}/en/results`, { waitUntil: "networkidle" });

    await page.getByRole("button", { name: REVEAL_CTA_EN }).click();

    const heading = page.getByRole("heading", {
      level: 2,
      name: ACTIVITY_GRID_HEADING_EN,
    });
    await expect(heading).toBeVisible();

    // Constraint #54: focus shifts to the activity-grid heading.
    await expect
      .poll(async () =>
        page.evaluate(() => document.activeElement?.id),
        { timeout: 2_000 },
      )
      .toBe("results-activity-grid-heading");
  });

  test("EN restart clears storage keys and lands on /en/quiz", async ({ page, baseURL }) => {
    if (!baseURL) throw new Error("baseURL must be set");
    await seedProfile(page, baseURL);
    // Also seed a draft so we can verify clearAll wipes both keys.
    await page.evaluate(
      ({ key, value }) => sessionStorage.setItem(key, value),
      { key: DRAFT_KEY, value: JSON.stringify({ version: 1 }) },
    );
    await page.goto(`${baseURL}/en/results`, { waitUntil: "networkidle" });

    await page.getByRole("button", { name: RESTART_EN }).click();
    await page.waitForURL(/\/en\/quiz$/);

    const stored = await page.evaluate(
      ({ profile, draft }) => ({
        profile: sessionStorage.getItem(profile),
        draft: sessionStorage.getItem(draft),
      }),
      { profile: PROFILE_KEY, draft: DRAFT_KEY },
    );
    expect(stored.profile).toBeNull();
    expect(stored.draft).toBeNull();
  });

  test("EN review link navigates to /en/quiz", async ({ page, baseURL }) => {
    if (!baseURL) throw new Error("baseURL must be set");
    await seedProfile(page, baseURL);
    await page.goto(`${baseURL}/en/results`, { waitUntil: "networkidle" });

    await page.getByRole("link", { name: REVIEW_EN }).click();
    await page.waitForURL(/\/en\/quiz$/);
  });

  test("EN: zero non-own-origin requests across the full reveal flow", async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) throw new Error("baseURL must be set");
    const offending: string[] = [];
    attachOriginGuard(page, new URL(baseURL).origin, offending);

    await seedProfile(page, baseURL);
    await page.goto(`${baseURL}/en/results`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: REVEAL_CTA_EN }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: ACTIVITY_GRID_HEADING_EN }),
    ).toBeVisible();

    expect(offending, `non-own-origin: ${offending.join(", ")}`).toEqual([]);
  });

  test("RU golden path: /ru/results renders RU and reveal CTA toggles activities", async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) throw new Error("baseURL must be set");
    const errors: string[] = [];
    attachConsoleErrorGuard(page, errors);

    // Seed via /ru/quiz to keep origin parity for RU.
    await page.goto(`${baseURL}/ru/quiz`, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ({ key, value }) => sessionStorage.setItem(key, value),
      { key: PROFILE_KEY, value: JSON.stringify(STABLE_PERSONA) },
    );

    await page.goto(`${baseURL}/ru/results`, { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { level: 1, name: HERO_HEADLINE_RU }),
    ).toBeVisible();

    await page.getByRole("button", { name: REVEAL_CTA_RU }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: ACTIVITY_GRID_HEADING_RU }),
    ).toBeVisible();

    expect(errors, `console / pageerror: ${errors.join("\n")}`).toEqual([]);
  });
});
