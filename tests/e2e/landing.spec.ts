import { test, expect, type Page, type Request } from "@playwright/test";

import { expectNoSportNames } from "./sport-name-lexicon";

/**
 * Fail the test on any browser console error or uncaught page error.
 * Specifically catches CSP violations (Refused to execute, Refused to load)
 * — without this guard a CSP regression can ship green because Playwright
 * tolerates blocked scripts as long as page navigation still works.
 */
function attachConsoleErrorGuard(page: Page, errors: string[]) {
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[console.error] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
}

test.describe("Landing page", () => {
  test("renders /en with no console errors and no CSP violations", async ({ page }) => {
    const errors: string[] = [];
    attachConsoleErrorGuard(page, errors);
    await page.goto("/en", { waitUntil: "networkidle" });
    expect(
      errors,
      `landing /en must not emit any console error (catches CSP violations): ${errors.join("\n")}`,
    ).toEqual([]);
  });

  test("redirects / to /en for a request without cookie or RU Accept-Language", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.url()).toMatch(/\/en$/);
  });

  test("redirects / to /ru when Accept-Language is ru", async ({ browser }) => {
    const context = await browser.newContext({ locale: "ru-RU" });
    const page = await context.newPage();
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/ru$/);
    await context.close();
  });

  test("renders English copy at /en and contains no sport names", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Discover how you love to move",
    );
    const body = await page.locator("body").innerText();
    expectNoSportNames(body);
  });

  test("LanguageSwitcher routes to /ru and persists via cookie", async ({ page, context }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: /language/i }).click();
    await page.getByRole("menuitem", { name: /русский/i }).click();
    await page.waitForURL(/\/ru$/);
    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === "movequest_locale");
    expect(localeCookie?.value).toBe("ru");

    await page.reload();
    expect(page.url()).toMatch(/\/ru$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Узнай, как ты любишь двигаться",
    );
    const ruBody = await page.locator("body").innerText();
    expectNoSportNames(ruBody);
  });

  test("CTA navigates to /<locale>/quiz", async ({ page }) => {
    await page.goto("/en");
    await page.getByTestId("hero-cta").click();
    await page.waitForURL(/\/en\/quiz$/);
    // The quiz route now renders the real intro heading (no longer the
    // Foundation "Coming soon" stub).
    await expect(page.getByRole("heading", { name: /ready to begin/i })).toBeVisible();
  });

  test("zero outbound network requests to non-own origins on landing load", async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) throw new Error("baseURL must be set");
    const ownOrigin = new URL(baseURL).origin;
    const offending: string[] = [];
    const recordRequest = (req: Request) => {
      const url = req.url();
      if (url.startsWith("data:") || url.startsWith("blob:")) return;
      const reqOrigin = new URL(url).origin;
      if (reqOrigin !== ownOrigin) offending.push(url);
    };
    page.on("request", recordRequest);
    await page.goto("/en", { waitUntil: "networkidle" });
    expect(
      offending,
      `landing must not make outbound requests (constraint #5): ${offending.join(", ")}`,
    ).toEqual([]);
  });

  test("CSP header is present and forbids inline scripts without nonce", async ({ page }) => {
    const response = await page.goto("/en");
    const csp = response?.headers()["content-security-policy"];
    expect(csp, "Content-Security-Policy header must be set").toBeDefined();
    expect(csp).toMatch(/default-src 'self'/);
    expect(csp).toMatch(/connect-src 'self'/);
    expect(csp).toMatch(/img-src 'self' data:/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });
});
