export type MessageNode = string | MessageObject;
export interface MessageObject {
  [key: string]: MessageNode;
}

function isPlainObject(value: unknown): value is MessageObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Deep-merges `overlay` on top of `base`. Used exactly once, at the i18n
 * boundary, to apply EN as a fallback under the requested locale's messages.
 *
 * Rules:
 * - The overlay wins for every own key it defines (including empty strings).
 * - Missing overlay keys fall through to the base.
 * - Nested objects are merged recursively; arrays and scalars are replaced wholesale.
 * - Inputs are not mutated.
 */
export function deepMerge<T extends MessageObject>(base: T, overlay: MessageObject): T {
  const result: MessageObject = { ...base };
  for (const key of Object.keys(overlay)) {
    if (!Object.prototype.hasOwnProperty.call(overlay, key)) continue;
    const overlayValue = overlay[key] as MessageNode;
    const baseValue = result[key];
    if (isPlainObject(baseValue) && isPlainObject(overlayValue)) {
      result[key] = deepMerge(baseValue, overlayValue);
    } else {
      result[key] = overlayValue;
    }
  }
  return result as T;
}
