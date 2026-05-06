/**
 * Generic cross-file referential-integrity helper. Parameterized over schema-
 * shaped inputs so that `shared/lib/*` does not import `entities/*` (constraint
 * #20). The entity wiring lives at the call site — typically a script in
 * `scripts/` or a vitest fixture.
 *
 * Each spec describes one invariant: every key produced by `sourceKeys(s)` for
 * each source row must appear in the set of keys produced by `referenceKey(r)`
 * across the reference array. Empty source arrays return ok (no-op).
 *
 * @remarks
 * The plural `sourceKeys` (returns `readonly string[]`) and the dedicated
 * `sourceId` extractor are intentional extensions of the original "single
 * sourceKey" sketch. The three matching-engine invariants all yield N keys
 * per row (`recommendedActivityIds[]`, `Object.keys(traitWeights)`,
 * `Object.keys(tagAffinities)`), and per-row triage requires the source's
 * identity, not just the dangling key — the bare key alone wouldn't tell
 * authors which archetype/activity owns the bad reference.
 */
export interface CrossCheckSpec<S, R> {
  /** Stable label included on every error (e.g. "Archetype.recommendedActivityIds → Activity.id"). */
  label: string;
  source: readonly S[];
  reference: readonly R[];
  /** Keys to verify per source row. */
  sourceKeys: (s: S) => readonly string[];
  /** Identifier of the source row, surfaced in the error for triage. */
  sourceId: (s: S) => string;
  /** Identifier extracted from each reference row to build the lookup set. */
  referenceKey: (r: R) => string;
}

export interface CrossCheckError {
  label: string;
  sourceId: string;
  key: string;
  message: string;
}

export type CrossCheckResult =
  | { ok: true }
  | { ok: false; errors: CrossCheckError[] };

export function crossCheck<S, R>(spec: CrossCheckSpec<S, R>): CrossCheckResult {
  const errors: CrossCheckError[] = [];
  const referenceSet = new Set<string>();
  for (const r of spec.reference) referenceSet.add(spec.referenceKey(r));

  for (const s of spec.source) {
    const keys = spec.sourceKeys(s);
    for (const key of keys) {
      if (!referenceSet.has(key)) {
        errors.push({
          label: spec.label,
          sourceId: spec.sourceId(s),
          key,
          message: `${spec.label}: '${spec.sourceId(s)}' references unknown id '${key}'`,
        });
      }
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
