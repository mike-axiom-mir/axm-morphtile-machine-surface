# Changelog

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
