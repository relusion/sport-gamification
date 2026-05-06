import type { SVGProps } from "react";

/**
 * Neutral SVG fallback icon for archetype/activity cards. Per-archetype
 * illustrations are post-MVP (constraint #64). Decorative by default;
 * callers can pass `aria-hidden={false}` and an explicit `aria-label`
 * to make it role="img".
 */
export function NeutralActivityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props["aria-label"] ? undefined : true}
      focusable={false}
      {...props}
    >
      <circle cx={16} cy={9} r={3} />
      <path d="M11 27l3-9 5-1 4 9" />
      <path d="M9 17l4-2" />
      <path d="M19 17l4 2" />
    </svg>
  );
}
