import { DEFAULT_LOCALE, type Locale } from "./config";
import { deepMerge, type MessageObject } from "./fallback";

const NAMESPACES = ["common", "landing", "quiz", "match"] as const;
type Namespace = (typeof NAMESPACES)[number];

export type Messages = Record<Namespace, MessageObject>;

const loaders: Record<Locale, Record<Namespace, () => Promise<{ default: MessageObject }>>> = {
  en: {
    common: () => import("../../../messages/en/common.json"),
    landing: () => import("../../../messages/en/landing.json"),
    quiz: () => import("../../../messages/en/quiz.json"),
    match: () => import("../../../messages/en/match.json"),
  },
  ru: {
    common: () => import("../../../messages/ru/common.json"),
    landing: () => import("../../../messages/ru/landing.json"),
    quiz: () => import("../../../messages/ru/quiz.json"),
    match: () => import("../../../messages/ru/match.json"),
  },
};

/**
 * Loads a locale's messages and applies the EN-fallback merge.
 *
 * This is the ONE place EN-fallback is implemented: every consumer (server
 * components, client provider, tests) receives already-merged messages.
 */
export async function getMessages(locale: Locale): Promise<Messages> {
  const merged: Partial<Messages> = {};
  for (const ns of NAMESPACES) {
    const enModule = await loaders[DEFAULT_LOCALE][ns]();
    const enBag: MessageObject = enModule.default ?? {};
    if (locale === DEFAULT_LOCALE) {
      merged[ns] = enBag;
      continue;
    }
    const overlayModule = await loaders[locale][ns]();
    const overlayBag: MessageObject = overlayModule.default ?? {};
    merged[ns] = deepMerge(enBag, overlayBag);
  }
  return merged as Messages;
}
