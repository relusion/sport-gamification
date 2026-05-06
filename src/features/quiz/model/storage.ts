import { QuizProfileSchema, type QuizProfile } from "@/entities/quiz-profile";

import { QuizDraftSchema } from "./draft-schema";
import type { QuizState } from "./types";

// Versioned storage keys (#46). Bump the v<N> suffix on schema-incompatible
// changes so stale drafts/profiles don't deserialize against a new shape; the
// stale entries simply look "missing" and the reducer initializes fresh.
export const DRAFT_KEY = "mq.quiz.draft.v1";
export const PROFILE_KEY = "mq.quiz.profile.v1";

function isDev(): boolean {
  // process.env access guarded for the browser bundle.
  if (typeof process === "undefined") return false;
  return process.env.NODE_ENV !== "production";
}

function getStore(): Storage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

function readKey(key: string): string | null {
  const store = getStore();
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch (err) {
    if (isDev()) console.warn(`[quiz/storage] read failed for ${key}`, err);
    return null;
  }
}

function writeKey(key: string, value: string): void {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch (err) {
    if (isDev()) console.warn(`[quiz/storage] write failed for ${key}`, err);
  }
}

function clearKeysAtomically(keys: readonly string[]): void {
  const store = getStore();
  if (!store) return;
  // Best-effort atomicity: try both, capture any failures, log once at the
  // end. A half-cleared state is still better than aborting after the first
  // remove succeeds — but we surface the error so it doesn't ship silent.
  const failures: Array<{ key: string; err: unknown }> = [];
  for (const key of keys) {
    try {
      store.removeItem(key);
    } catch (err) {
      failures.push({ key, err });
    }
  }
  if (failures.length > 0 && isDev()) {
    console.warn(
      `[quiz/storage] clearAll partial failure: ${failures.map((f) => f.key).join(", ")}`,
      failures,
    );
  }
}

export function readDraft(): QuizState | null {
  const raw = readKey(DRAFT_KEY);
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = QuizDraftSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

export function writeDraft(state: QuizState): void {
  // Re-validate on the way out — the reducer is typed but a future shape
  // change shouldn't ship a malformed draft into storage that a later reader
  // would silently drop on hydrate.
  const result = QuizDraftSchema.safeParse(state);
  if (!result.success) {
    if (isDev()) console.warn("[quiz/storage] refusing to write invalid draft", result.error);
    return;
  }
  writeKey(DRAFT_KEY, JSON.stringify(state));
}

export function readProfile(): QuizProfile | null {
  const raw = readKey(PROFILE_KEY);
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = QuizProfileSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

export function writeProfile(profile: QuizProfile): void {
  const result = QuizProfileSchema.safeParse(profile);
  if (!result.success) {
    if (isDev()) console.warn("[quiz/storage] refusing to write invalid profile", result.error);
    return;
  }
  writeKey(PROFILE_KEY, JSON.stringify(profile));
}

export function clearAll(): void {
  clearKeysAtomically([DRAFT_KEY, PROFILE_KEY]);
}
