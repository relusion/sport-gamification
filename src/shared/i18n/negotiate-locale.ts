import { DEFAULT_LOCALE, type Locale, isLocale } from "./config";

export interface NegotiationInput {
  acceptLanguage: string | null;
  cookieLocale: string | null;
}

interface RankedLanguage {
  tag: string;
  quality: number;
}

export function negotiateLocale(input: NegotiationInput): Locale {
  if (isLocale(input.cookieLocale)) {
    return input.cookieLocale;
  }

  const ranked = parseAcceptLanguage(input.acceptLanguage);
  for (const candidate of ranked) {
    const primary = candidate.tag.split("-")[0]?.toLowerCase();
    if (primary && isLocale(primary)) {
      return primary;
    }
  }
  return DEFAULT_LOCALE;
}

function parseAcceptLanguage(header: string | null): RankedLanguage[] {
  if (!header) return [];
  const parts = header.split(",");
  const ranked: RankedLanguage[] = [];
  for (const raw of parts) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const [tag, ...params] = trimmed.split(";").map((s) => s.trim());
    if (!tag) continue;
    let quality = 1.0;
    for (const param of params) {
      const match = /^q\s*=\s*([0-9.]+)$/i.exec(param);
      if (match && match[1]) {
        const parsed = Number.parseFloat(match[1]);
        if (Number.isFinite(parsed)) {
          quality = parsed;
        }
      }
    }
    ranked.push({ tag, quality });
  }
  // Stable sort: preserve declaration order for equal quality.
  return ranked
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map(({ tag, quality }) => ({ tag, quality }));
}
