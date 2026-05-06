import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { QuizProfile } from "@/entities/quiz-profile";

import {
  DRAFT_KEY,
  PROFILE_KEY,
  clearAll,
  readDraft,
  readProfile,
  writeDraft,
  writeProfile,
} from "./storage";
import { initialQuizState, type QuizState } from "./types";

const validProfile: QuizProfile = {
  version: 1,
  tagScores: { calm: 1 },
  answers: [{ questionId: "q-1", answerIds: ["a"] }],
};

const validDraft: QuizState = {
  ...initialQuizState,
  phase: "step",
  currentStepIndex: 1,
  answers: { "q-1": ["a"] },
};

describe("storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("readDraft returns null when nothing is stored", () => {
    expect(readDraft()).toBeNull();
  });

  it("write-then-read round-trips a draft", () => {
    writeDraft(validDraft);
    expect(readDraft()).toEqual(validDraft);
  });

  it("readDraft returns null for malformed JSON (silent)", () => {
    sessionStorage.setItem(DRAFT_KEY, "{not json");
    expect(readDraft()).toBeNull();
  });

  it("readDraft returns null when the stored draft fails schema validation", () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ phase: "wrong-phase" }));
    expect(readDraft()).toBeNull();
  });

  it("write-then-read round-trips a profile", () => {
    writeProfile(validProfile);
    expect(readProfile()).toEqual(validProfile);
  });

  it("readProfile returns null when stored value fails schema validation", () => {
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify({ version: 99 }));
    expect(readProfile()).toBeNull();
  });

  it("clearAll removes both keys", () => {
    writeDraft(validDraft);
    writeProfile(validProfile);
    clearAll();
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(sessionStorage.getItem(PROFILE_KEY)).toBeNull();
  });

  it("writeDraft swallows SecurityError (private/incognito mode)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota / private", "SecurityError");
    });
    // Must not throw
    expect(() => writeDraft(validDraft)).not.toThrow();
  });

  it("writeProfile swallows SecurityError (private/incognito mode)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota / private", "SecurityError");
    });
    expect(() => writeProfile(validProfile)).not.toThrow();
  });

  it("readDraft swallows SecurityError on access", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(readDraft()).toBeNull();
  });

  it("clearAll swallows SecurityError", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(() => clearAll()).not.toThrow();
  });

  it("readDraft returns null in non-browser environments (no sessionStorage)", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      get() {
        throw new ReferenceError("sessionStorage is not defined");
      },
    });
    try {
      expect(readDraft()).toBeNull();
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "sessionStorage", originalDescriptor);
      }
    }
  });
});
