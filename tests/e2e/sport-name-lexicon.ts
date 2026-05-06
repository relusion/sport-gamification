import { expect } from "@playwright/test";

/**
 * Sport-name lexicon shared across e2e suites. Used to enforce constraint #2
 * (sport-name silence in the pre-result UI in EN and RU).
 *
 * The list errs on the side of catching false positives — better a CI fail
 * during authoring than a sport name shipping to a kid's quiz.
 */
export const SPORT_NAMES_EN = [
  "football",
  "soccer",
  "basketball",
  "tennis",
  "swimming",
  "baseball",
  "softball",
  "hockey",
  "rugby",
  "volleyball",
  "handball",
  "cricket",
  "golf",
  "boxing",
  "karate",
  "judo",
  "taekwondo",
  "gymnastics",
  "skating",
  "skateboard",
  "skateboarding",
  "skiing",
  "snowboarding",
  "surfing",
  "yoga",
  "pilates",
  "running",
  "cycling",
  "biking",
  "dance",
  "dancing",
  "ballet",
  "wrestling",
  "climbing",
  "bouldering",
  "parkour",
  "crossfit",
  "lacrosse",
  "cheerleading",
  "archery",
  "fencing",
  "rowing",
  "kayaking",
  "paddle",
  "pickleball",
  "squash",
  "badminton",
  "bowling",
  "equestrian",
  "horse",
  "riding",
  "triathlon",
  "marathon",
  "weightlifting",
  "diving",
  "hiking",
];

export const SPORT_NAMES_RU = [
  "футбол",
  "баскетбол",
  "теннис",
  "плава", // плавание / плавать stem
  "бокс",
  "карате",
  "дзюдо",
  "гимнастика",
  "коньки",
  "лыжи",
  "сноуборд",
  "сёрфинг",
  "йога",
  "пилатес",
  "бег",
  "велосипед",
  "танцы",
  "танец",
  "балет",
  "борьба",
  "скалолазание",
  "боулдеринг",
  "паркур",
  "гребля",
  "байдарка",
  "бадминтон",
  "сквош",
  "регби",
  "волейбол",
  "крикет",
  "гольф",
  "хоккей",
  "скейт",
  "марафон",
  "триатлон",
];

export const SPORT_NAMES = [...SPORT_NAMES_EN, ...SPORT_NAMES_RU];

/**
 * Asserts that none of the lexicon terms appear (case-insensitive) in the
 * provided body text. Each violating term is surfaced with the term name so
 * authoring fixes are obvious.
 */
export function expectNoSportNames(text: string): void {
  const lower = text.toLowerCase();
  for (const term of SPORT_NAMES) {
    expect(
      lower.includes(term),
      `pre-result UI must not mention sport name "${term}" (constraint #2)`,
    ).toBe(false);
  }
}
