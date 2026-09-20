# Changelog

## 0.5.0 — 2026-09-20

- Added bounded `axis_gradient` surface vocabulary over MorphTile's existing per-triangle `x`, `y`, and `z` paint variables.
- Gradient rules require an explicit `x|y|z` axis, finite authored `from`/`to` values with `to > from`, and strict RGB endpoint colors; numeric-looking strings, booleans, null, unknown fields and malformed ranges fail closed.
- Compiles gradients to deterministic clamped MorphTile expression trees: below-range matter uses `start_color`, above-range matter uses `end_color`, and only the declared interval interpolates.
- Added exact pinned-runtime receipts for all three axes through real `createTile → validateTile → compileMesh`, proving geometry/base triangle material identity is unchanged while procedural paint stays within the declared endpoint bounds and produces multiple position-dependent colors.
- Added a reusable axis-gradient request fixture and advanced machine/package metadata to `0.5.0`.
- Kept axis gradients in Surface Machine because MorphTile already has the universal position-aware paint substrate; no new core primitive was required.
- Preserved TECHNICALLY VALID vs VISUALLY GOOD as separate evidence classes; rendered/aesthetic proof remains separate.

## 0.4.0 — 2026-09-20

- Added a bounded creation-side material pattern vocabulary for MorphTile's existing `checker` and `stripes` runtime semantics.
- Pattern scale defaults to `0.5` only when omitted and otherwise requires an authored positive finite number; numeric-looking non-number values fail closed.
- Unknown pattern fields and unsupported names return explicit HOLDs rather than falling through to MorphTile's generic pattern/noise implementation branch.
- Kept pattern modulation orthogonal to procedural paint and named facing rules instead of silently replacing either authoring layer.
- Added exact runtime receipts proving named patterns preserve geometry positions and procedural-paint colors while applying only their declared deterministic triangle attenuation factors.
- Advanced the exact MorphTile compatibility pin to `ef2b3c6986aa1a333247feffc43a8443f17239d0` for this candidate; compatibility remains replay-earned.
- Preserved TECHNICALLY VALID vs VISUALLY GOOD as separate evidence classes.

## 0.3.0 — 2026-09-20

- Director review additionally repaired explicit falsey `surface_rule` values: only omission selects default paint; authored invalid rules HOLD. Eighteen tests and the independent Verification boundary check pass after this repair.

- Added a fail-closed top-level surface intent contract so unsupported or misspelled fields cannot be silently ignored.
- Bounded `base_color`, caller `paint` shape, numeric paint vars, and external dependency names before candidate emission.
- Repaired authored numeric handling after independent Verification exposed semantic coercion: numeric-looking strings, booleans and null now HOLD instead of being passed through `Number(...)`.
- Applied the same strict authored-number rule to named facing thresholds and colors.
- Kept caller-authored paint expressions available while explicitly warning that expression semantics belong to the MorphTile runtime.
- Extended exact runtime conformance to execute the existing caller-paint fixture as well as all six named facing rules.
- Advanced the exact MorphTile compatibility target to `a579182ae585e5722ac87dd0cc8209963b18d000`; compatibility is earned by replay, not inference.
- Preserved TECHNICALLY VALID vs VISUALLY GOOD as separate evidence classes.

## 0.2.0 — 2026-09-20

- Added a deterministic `facing` surface-rule vocabulary for six named directions.
- Compiles those rules into MorphTile's existing normal-aware paint variables instead of requiring hand-authored expressions.
- Added explicit HOLD codes for unknown directions, invalid thresholds/colors, raw-paint/rule authorship conflicts, and unknown surface-rule fields.
- Unknown fields fail closed so misspelled or unsupported creation intent cannot be silently ignored.
- Preserved the boundary between structural validity and untested visual quality.

## 0.1.0 — 2026-09-19

- Established the isolated repository boundary.
- Added provisional envelope v0.1, machine manifest, fixture, executable proof, tests, and minimal CI.
- Pinned the exact MorphTile v0.4 commit tested as a contract target.
- Recorded unsupported work as HOLD or NOT TESTED.
