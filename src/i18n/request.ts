import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, isLocale } from "@/shared/i18n/config";
import { getMessages } from "@/shared/i18n/get-messages";

/**
 * next-intl's per-request config. Loads messages via the same EN-fallback
 * deep-merge used everywhere else (constraint #7) so this is the only
 * server-side i18n entry point.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  return {
    locale,
    messages: await getMessages(locale),
  };
});
