import type { ReactElement, SVGProps } from "react";

/**
 * Local SVG icon set for the visual question type. Local-only (constraint #3
 * zero-egress, #48). Each icon is keyed by a stable token, NOT a sport name
 * (#2). The visual card resolves answer.id → icon via {@link iconForAnswer}.
 */
export type IconKey =
  | "calm"
  | "burst"
  | "outdoor"
  | "indoor"
  | "team"
  | "alone"
  | "morning"
  | "evening"
  | "structured"
  | "freeform"
  | "fallback";

const baseProps = (props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: 32,
  height: 32,
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
  ...props,
});

export function CalmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 18 Q 10 10 16 18 T 28 18" />
      <path d="M4 24 Q 10 16 16 24 T 28 24" />
    </svg>
  );
}

export function BurstIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="16" cy="16" r="4" />
      <path d="M16 4v4M16 24v4M4 16h4M24 16h4M7 7l3 3M22 22l3 3M7 25l3-3M22 10l3-3" />
    </svg>
  );
}

export function OutdoorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="22" cy="10" r="3" />
      <path d="M4 26l6-10 5 6 4-4 9 8" />
    </svg>
  );
}

export function IndoorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 26V14l10-7 10 7v12" />
      <path d="M13 26v-7h6v7" />
    </svg>
  );
}

export function TeamIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="11" cy="12" r="3" />
      <circle cx="21" cy="12" r="3" />
      <path d="M5 24c0-3 3-5 6-5s6 2 6 5" />
      <path d="M15 24c0-3 3-5 6-5s6 2 6 5" />
    </svg>
  );
}

export function AloneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="16" cy="11" r="4" />
      <path d="M8 26c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function MorningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 22h24" />
      <path d="M16 6v6" />
      <path d="M9 13l4-4M23 13l-4-4" />
      <circle cx="16" cy="18" r="4" />
    </svg>
  );
}

export function EveningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M22 6a8 8 0 1 0 4 12 6 6 0 0 1-4-12z" />
    </svg>
  );
}

export function StructuredIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <rect x="6" y="6" width="20" height="20" rx="2" />
      <path d="M6 13h20M13 6v20" />
    </svg>
  );
}

export function FreeformIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 22c4-12 8 4 12-8s8 12 10 0" />
    </svg>
  );
}

export function FallbackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="16" cy="16" r="6" />
    </svg>
  );
}

const REGISTRY: Record<IconKey, (p: SVGProps<SVGSVGElement>) => ReactElement> = {
  calm: CalmIcon,
  burst: BurstIcon,
  outdoor: OutdoorIcon,
  indoor: IndoorIcon,
  team: TeamIcon,
  alone: AloneIcon,
  morning: MorningIcon,
  evening: EveningIcon,
  structured: StructuredIcon,
  freeform: FreeformIcon,
  fallback: FallbackIcon,
};

/**
 * Resolve an answer id to an icon component. Convention: visual-card answer
 * ids match an IconKey above. Unknown ids fall back to a neutral circle —
 * authoring should still pick a registered key, but the fallback keeps the
 * UI from breaking on a typo.
 */
export function iconForAnswer(
  answerId: string,
): (p: SVGProps<SVGSVGElement>) => ReactElement {
  if (answerId in REGISTRY) return REGISTRY[answerId as IconKey];
  return REGISTRY.fallback;
}
