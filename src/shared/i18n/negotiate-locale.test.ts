import { describe, it, expect } from "vitest";

import { negotiateLocale } from "./negotiate-locale";

describe("negotiateLocale", () => {
  it("returns the cookie locale when it is supported", () => {
    expect(
      negotiateLocale({ acceptLanguage: "en-US", cookieLocale: "ru" }),
    ).toBe("ru");
  });

  it("ignores an unsupported cookie locale and falls back to Accept-Language", () => {
    expect(
      negotiateLocale({ acceptLanguage: "ru-RU,ru;q=0.9", cookieLocale: "fr" }),
    ).toBe("ru");
  });

  it("picks the highest-quality supported language from Accept-Language", () => {
    expect(
      negotiateLocale({
        acceptLanguage: "fr;q=1.0, ru;q=0.8, en;q=0.6",
        cookieLocale: null,
      }),
    ).toBe("ru");
  });

  it("matches the language tag regardless of region (en-GB → en)", () => {
    expect(
      negotiateLocale({ acceptLanguage: "en-GB,en;q=0.9", cookieLocale: null }),
    ).toBe("en");
  });

  it("returns the default locale when nothing is supported", () => {
    expect(
      negotiateLocale({ acceptLanguage: "fr,de;q=0.8", cookieLocale: null }),
    ).toBe("en");
  });

  it("returns the default locale when no signals are present", () => {
    expect(negotiateLocale({ acceptLanguage: null, cookieLocale: null })).toBe(
      "en",
    );
  });

  it("treats empty Accept-Language as no signal", () => {
    expect(negotiateLocale({ acceptLanguage: "", cookieLocale: null })).toBe(
      "en",
    );
  });

  it("skips malformed Accept-Language entries and ranks the rest by quality", () => {
    // The leading ";q=" entry has no tag and must be ignored;
    // remaining well-formed entries still pick the highest quality.
    expect(
      negotiateLocale({
        acceptLanguage: ";q=,ru;q=0.9,en;q=0.5",
        cookieLocale: null,
      }),
    ).toBe("ru");
  });
});
