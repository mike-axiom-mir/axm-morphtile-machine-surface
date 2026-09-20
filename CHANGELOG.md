# Changelog

## 0.3.0 — 2026-09-20

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
