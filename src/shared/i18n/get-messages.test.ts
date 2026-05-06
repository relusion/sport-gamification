import { describe, it, expect, vi, beforeEach } from "vitest";

import { deepMerge } from "./fallback";

describe("deepMerge (EN-fallback)", () => {
  it("falls back to EN when the RU key is missing", () => {
    const merged = deepMerge(
      { hello: "Hello", goodbye: "Goodbye" },
      { hello: "Привет" },
    );
    expect(merged).toEqual({ hello: "Привет", goodbye: "Goodbye" });
  });

  it("merges nested objects (missing nested RU keys fall through to EN)", () => {
    const merged = deepMerge(
      {
        landing: { hero: { title: "Move", subtitle: "Discover" } },
        common: { back: "Back" },
      },
      { landing: { hero: { title: "Двигайся" } } },
    );
    expect(merged).toEqual({
      landing: { hero: { title: "Двигайся", subtitle: "Discover" } },
      common: { back: "Back" },
    });
  });

  it("does not mutate the EN base", () => {
    const base = { a: { b: "B" } };
    const overlay = { a: { c: "C" } };
    deepMerge(base, overlay);
    expect(base).toEqual({ a: { b: "B" } });
  });

  it("treats explicit RU empty string as a present value (does not fall back)", () => {
    const merged = deepMerge({ key: "EN" }, { key: "" });
    expect(merged).toEqual({ key: "" });
  });

  it("returns the EN base when the overlay is empty", () => {
    expect(deepMerge({ a: "A", b: "B" }, {})).toEqual({ a: "A", b: "B" });
  });
});

describe("getMessages", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("merges EN under the requested locale exactly once", async () => {
    vi.doMock("../../../messages/en/common.json", () => ({
      default: { greeting: "Hello", missing: "Only EN" },
    }));
    vi.doMock("../../../messages/en/landing.json", () => ({
      default: { hero: "Discover" },
    }));
    vi.doMock("../../../messages/en/quiz.json", () => ({
      default: { ui: { next: "Next" } },
    }));
    vi.doMock("../../../messages/ru/common.json", () => ({
      default: { greeting: "Привет" },
    }));
    vi.doMock("../../../messages/ru/landing.json", () => ({
      default: {},
    }));
    vi.doMock("../../../messages/ru/quiz.json", () => ({
      default: { ui: { next: "Дальше" } },
    }));

    const { getMessages } = await import("./get-messages");
    const messages = await getMessages("ru");
    expect(messages.common).toEqual({ greeting: "Привет", missing: "Only EN" });
    expect(messages.landing).toEqual({ hero: "Discover" });
    expect(messages.quiz).toEqual({ ui: { next: "Дальше" } });
  });

  it("returns EN messages unchanged when locale is en", async () => {
    vi.doMock("../../../messages/en/common.json", () => ({
      default: { greeting: "Hello" },
    }));
    vi.doMock("../../../messages/en/landing.json", () => ({
      default: { hero: "Discover" },
    }));
    vi.doMock("../../../messages/en/quiz.json", () => ({
      default: { ui: { next: "Next" } },
    }));
    vi.doMock("../../../messages/ru/common.json", () => ({
      default: { greeting: "Привет" },
    }));
    vi.doMock("../../../messages/ru/landing.json", () => ({
      default: {},
    }));
    vi.doMock("../../../messages/ru/quiz.json", () => ({
      default: {},
    }));

    const { getMessages } = await import("./get-messages");
    const messages = await getMessages("en");
    expect(messages.common).toEqual({ greeting: "Hello" });
    expect(messages.quiz).toEqual({ ui: { next: "Next" } });
  });

  it("falls back to EN for missing RU keys in the quiz namespace", async () => {
    vi.doMock("../../../messages/en/common.json", () => ({ default: {} }));
    vi.doMock("../../../messages/en/landing.json", () => ({ default: {} }));
    vi.doMock("../../../messages/en/quiz.json", () => ({
      default: { ui: { next: "Next", back: "Back (EN-only)" } },
    }));
    vi.doMock("../../../messages/ru/common.json", () => ({ default: {} }));
    vi.doMock("../../../messages/ru/landing.json", () => ({ default: {} }));
    vi.doMock("../../../messages/ru/quiz.json", () => ({
      default: { ui: { next: "Дальше" } },
    }));

    const { getMessages } = await import("./get-messages");
    const messages = await getMessages("ru");
    expect(messages.quiz).toEqual({ ui: { next: "Дальше", back: "Back (EN-only)" } });
  });
});
