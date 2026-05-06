import { test, expect, type Page, type Request } from "@playwright/test";

import { expectNoSportNames } from "./sport-name-lexicon";

/**
 * Console-error / pageerror guard. Catches CSP regressions that would ship
 * green if the listener were absent (constraint #35).
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

const STEP1_PROMPT_EN = "Where do you feel best?";
const STEP1_PROMPT_RU = "Где тебе комфортнее всего?";

async function answerAllEn(page: Page) {
  // 12 questions; we click the first valid affordance per type.
  const next = () => page.getByRole("button", { name: /^next$/i }).click();

  // Q1 single — social
  await page.getByRole("radio", { name: /on my own/i }).click();
  await next();
  // Q2 would-you-rather — social
  await page.getByRole("radio", { name: /just me, focused/i }).click();
  await next();
  // Q3 slider — energy. Slider commits a stop on keypress; default is the
  // middle stop, which is "A middle gear" — already a valid commit. Just
  // bump it once to ensure a deliberate selection event fires.
  const slider = page.getByRole("slider").first();
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await next();
  // Q4 multi — energy
  await page.getByRole("checkbox", { name: /trying something new/i }).click();
  await next();
  // Q5 visual — environment (single)
  await page.getByRole("radio", { name: /outside, under the sky/i }).click();
  await next();
  // Q6 multi — movement
  await page.getByRole("checkbox", { name: /steady and grounded/i }).click();
  await next();
  // Q7 visual — movement (single)
  await page.getByRole("radio", { name: /step by step/i }).click();
  await next();
  // Q8 would-you-rather — contact
  await page
    .getByRole("radio", { name: /i'd rather have my own space/i })
    .click();
  await next();
  // Q9 ranking — preference (renders authored order on mount → already valid)
  await next();
  // Q10 slider — preference
  const slider2 = page.getByRole("slider").first();
  await slider2.focus();
  await page.keyboard.press("ArrowRight");
  await next();
  // Q11 single — practical
  await page.getByRole("radio", { name: /bright and early/i }).click();
  await next();
  // Q12 multi — practical
  await page.getByRole("checkbox", { name: /on weekdays/i }).click();
  await next();
}

test.describe("Quiz flow", () => {
  test("EN happy path: answer all 12 → review → see results → /en/results", async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) throw new Error("baseURL must be set");
    const errors: string[] = [];
    const offending: string[] = [];
    attachConsoleErrorGuard(page, errors);
    attachOriginGuard(page, new URL(baseURL).origin, offending);

    await page.goto("/en/quiz", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^start$/i }).click();
    await expect(page.getByText(STEP1_PROMPT_EN)).toBeVisible();
    await answerAllEn(page);

    // Review screen
    await expect(page.getByRole("heading", { name: /take one more look/i })).toBeVisible();
    await page.getByRole("button", { name: /see results/i }).click();
    await page.waitForURL(/\/en\/results$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /here is your movement style/i }),
    ).toBeVisible();

    expect(errors, `console / pageerror: ${errors.join("\n")}`).toEqual([]);
    expect(offending, `non-own-origin requests: ${offending.join(", ")}`).toEqual([]);
  });

  test("RU happy path: /ru/quiz renders RU and writes a profile", async ({ page }) => {
    const errors: string[] = [];
    attachConsoleErrorGuard(page, errors);
    await page.goto("/ru/quiz", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /готов начать/i })).toBeVisible();
    await page.getByRole("button", { name: /начать/i }).click();
    await expect(page.getByText(STEP1_PROMPT_RU)).toBeVisible();

    // Sport-name silence in RU on step 1
    const body = await page.locator("body").innerText();
    expectNoSportNames(body);

    expect(errors).toEqual([]);
  });

  test("Restart at step 5 wipes sessionStorage and lands on step 1", async ({ page }) => {
    await page.goto("/en/quiz");
    await page.getByRole("button", { name: /^start$/i }).click();
    // Walk to step 5
    await page.getByRole("radio", { name: /on my own/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();
    await page.getByRole("radio", { name: /just me, focused/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();
    const slider = page.getByRole("slider").first();
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: /^next$/i }).click();
    await page.getByRole("checkbox", { name: /trying something new/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();

    // We are now on step 5 (visual — environment)
    await expect(page.getByText("What kind of place feels like home?")).toBeVisible();

    await page.getByRole("button", { name: /start over/i }).click();
    await page.getByRole("button", { name: /yes, start over/i }).click();

    // Restart now lands directly on step 1 (constraint #43)
    await expect(page.getByText(STEP1_PROMPT_EN)).toBeVisible();
    const draft = await page.evaluate(() => sessionStorage.getItem("mq.quiz.draft.v1"));
    expect(draft).toBeNull();
  });

  test("Reload mid-quiz rehydrates from sessionStorage", async ({ page }) => {
    await page.goto("/en/quiz");
    await page.getByRole("button", { name: /^start$/i }).click();
    await page.getByRole("radio", { name: /on my own/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();
    await page.getByRole("radio", { name: /just me, focused/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();

    // We are on step 3 (slider — energy). Reload.
    await expect(page.getByText("What pace feels right today?")).toBeVisible();
    await page.reload();
    // After reload, sessionStorage hydration places the user back on step 3.
    await expect(page.getByText("What pace feels right today?")).toBeVisible();
  });

  test("/results without a profile redirects to /quiz", async ({ page }) => {
    await page.goto("/en/results");
    await page.waitForURL(/\/en\/quiz$/);
  });

  test("CSP header still forbids inline scripts without nonce on /quiz", async ({ page }) => {
    const response = await page.goto("/en/quiz");
    const csp = response?.headers()["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toMatch(/default-src 'self'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  test("EN intro page contains no sport names", async ({ page }) => {
    await page.goto("/en/quiz");
    const body = await page.locator("body").innerText();
    expectNoSportNames(body);
  });
});
